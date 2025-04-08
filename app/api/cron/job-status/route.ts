import { getAbi } from "@/contracts/abi"; // Assuming getAbi is correctly defined elsewhere
import axios, { AxiosError } from "axios";
import {
  ethers,
  Wallet,
  Contract,
  JsonRpcProvider,
  LogDescription,
} from "ethers";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// --- Configuration ---
// Essential environment variables
const PRIVATE_KEY = process.env.APP_WALLET_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || "https://rpc.moksha.vana.org";
const APP_API_SERVER_URL =
  process.env.APP_API_SERVER_URL || "http://34.56.88.201";
const COMPUTE_ENGINE_ADDRESS =
  process.env.COMPUTE_ENGINE_ADDRESS ||
  "0x959C44c02c5ac8e3066319102b2Fc2412E15B6a8";

const COMPUTE_INSTRUCTION_ID = process.env.COMPUTE_INSTRUCTION_ID || 15;
const JOB_FUNDING_AMOUNT_ETH = "0.001"; // Funding amount in Ether
const CONTRACT_MAX_TIMEOUT_SECONDS = 100; // Max job duration on contract
const CONTRACT_GPU_REQUIRED = false; // GPU requirement for contract job
const API_TIMEOUT_MS = 15000; // Unified timeout for all API calls (15 seconds)
const POLLING_INTERVAL_MS = 10000; // Interval between status checks (10 seconds)
const MAX_POLLING_ATTEMPTS = 15; // Max number of status check attempts

const SQL_QUERY = `
SELECT
  u.user_id AS userId,
  u.email,
  CAST(strftime('%s', u.created_at) AS INTEGER) AS timestamp,
  u.name,
  u.locale,
  sm.percent_used AS percentUsed,
  a.source,
  a.collection_date AS collectionDate,
  a.data_type AS dataType
FROM users u
LEFT JOIN auth_sources a ON u.user_id = a.user_id
LEFT JOIN storage_metrics sm ON u.user_id = sm.user_id;
`;
const REFINER_ID = process.env.REFINER_ID
  ? parseInt(process.env.REFINER_ID)
  : 4;

// --- Constants ---
const COMPLETED_JOB_STATUSES = new Set([
  "completed",
  "failed",
  "query_failed",
  "canceled",
  "success",
]);
const SUCCESS_STATUS = "success";

// --- Types ---
interface JobSubmissionRequest {
  input: {
    query: string;
    query_signature: string;
    refiner_id: number;
  };
}

interface Artifact {
  name: string;
  url: string;
}

interface JobStatusResponse {
  status: string;
  run_id?: string;
  artifacts?: Artifact[];
}

// Define User interface that matches the expected output
interface User {
  userId: string;
  email: string;
  timestamp: number | string;
  profile: {
    name: string;
    locale: string;
  };
  storage: {
    percentUsed: number | string | null;
  };
  metadata: {
    source: string | null;
    collectionDate: string | null;
    dataType: string | null;
  };
}

// Type guard for LogDescription with specific args structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JobRegisteredEvent = LogDescription & { args: [bigint, ...any[]] };

function isJobRegisteredEvent(
  event: LogDescription | null | undefined
): event is JobRegisteredEvent {
  return event?.name === "JobRegistered" && typeof event.args?.[0] === "bigint";
}

// --- Initialization ---
if (!PRIVATE_KEY) {
  // Fatal error if private key is missing
  console.error(
    "FATAL: APP_WALLET_PRIVATE_KEY environment variable is not set."
  );
  process.exit(1);
}

// Setup Ethereum provider and signer wallet
const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

// --- Helper Functions ---

/**
 * Signs a message using the application's wallet.
 * @param message The message string to sign.
 * @returns The signature string.
 */
const signMessage = async (message: string): Promise<string> => {
  try {
    const signature = await wallet.signMessage(message);
    return signature;
  } catch (error) {
    console.error("Error signing message:", error);
    throw new Error(
      `Failed to sign message: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Submits a job to the smart contract.
 * @returns The job ID obtained from the contract event.
 * @throws If the contract interaction or event parsing fails.
 */
const submitJobToContract = async (): Promise<number> => {
  const abi = getAbi("ComputeEngineProxy");
  const contract = new Contract(COMPUTE_ENGINE_ADDRESS, abi, wallet);
  const fundingAmountWei = ethers.parseEther(JOB_FUNDING_AMOUNT_ETH);

  console.log(`Submitting job to contract ${COMPUTE_ENGINE_ADDRESS}...`);
  console.log(
    ` - Funding: ${JOB_FUNDING_AMOUNT_ETH} ETH (${fundingAmountWei.toString()} wei)`
  );
  console.log(` - Max Timeout: ${CONTRACT_MAX_TIMEOUT_SECONDS}s`);
  console.log(` - GPU Required: ${CONTRACT_GPU_REQUIRED}`);
  console.log(` - Instruction ID: ${COMPUTE_INSTRUCTION_ID}`);

  try {
    // Submit the job transaction
    const tx = await contract.submitJob(
      CONTRACT_MAX_TIMEOUT_SECONDS,
      CONTRACT_GPU_REQUIRED,
      COMPUTE_INSTRUCTION_ID,
      { value: fundingAmountWei }
    );

    console.log(`Contract job submission transaction sent: ${tx.hash}`);

    // Wait for the transaction to be confirmed
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Transaction receipt is null, confirmation failed.");
    }
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Find and parse the JobRegistered event
    let jobRegisteredEvent: JobRegisteredEvent | undefined;
    if (receipt.logs) {
      for (const log of receipt.logs) {
        // Ensure log has necessary properties before parsing
        if (
          log.address.toLowerCase() === COMPUTE_ENGINE_ADDRESS.toLowerCase()
        ) {
          try {
            const parsedLog = contract.interface.parseLog(log as ethers.Log); // Use ethers.Log type
            if (isJobRegisteredEvent(parsedLog)) {
              jobRegisteredEvent = parsedLog;
              break; // Found the event, no need to check further logs
            }
          } catch (parseError) {
            // Log parsing errors but don't fail the whole process if one log is problematic
            console.warn(
              `Could not parse log: ${
                parseError instanceof Error
                  ? parseError.message
                  : String(parseError)
              }`
            );
          }
        }
      }
    }

    if (!jobRegisteredEvent) {
      console.error(
        "JobRegistered event not found or jobId is invalid in transaction receipt:",
        receipt
      );
      throw new Error(
        "Job creation failed: Could not find valid JobRegistered event"
      );
    }

    // Extract and return the jobId
    const jobId = Number(jobRegisteredEvent.args[0]); // Convert BigInt to number
    console.log(`Successfully registered job ID with contract: ${jobId}`);
    return jobId;
  } catch (error) {
    console.error("Error submitting job to contract:", error);
    // More specific error handling could be added here (e.g., insufficient funds)
    throw new Error(
      `Failed to submit job to contract: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Submits job details to the application's API server.
 * @param jobId The job ID obtained from the contract.
 * @returns The API server's response data, expected to include a run_id.
 * @throws If the API request fails or times out.
 */
const submitJobToApi = async (jobId: number): Promise<JobStatusResponse> => {
  const jobIdStr = jobId.toString();
  const jobIdSignature = await signMessage(jobIdStr);
  const querySignature = await signMessage(SQL_QUERY);

  const jobRequest: JobSubmissionRequest = {
    input: {
      query: SQL_QUERY,
      query_signature: querySignature,
      refiner_id: REFINER_ID,
    },
  };

  const headers = {
    "Content-Type": "application/json",
    "x-job-id-signature": jobIdSignature,
  };

  const url = `${APP_API_SERVER_URL}/job/${jobId}`;
  console.log(`Submitting job details to API server: POST ${url}`);
  console.log(
    ` - Request body (partial): ${JSON.stringify(jobRequest.input).substring(
      0,
      100
    )}...`
  );

  try {
    const response = await axios.post<JobStatusResponse>(url, jobRequest, {
      headers,
      timeout: API_TIMEOUT_MS, // Use unified timeout
    });
    console.log(
      `API submission successful (status ${response.status}). Run ID: ${
        response.data?.run_id || "N/A"
      }`
    );
    if (!response.data?.run_id) {
      console.warn("API response missing 'run_id'.", response.data);
      // Depending on requirements, you might want to throw an error here
    }
    return response.data;
  } catch (error) {
    console.error(`API submission failed for job ID ${jobId}:`, error);
    if (axios.isAxiosError(error)) {
      logAxiosError(error, `API job submission (POST ${url})`);
      throw new Error(
        `API submission error: ${error.message} (Status: ${error.response?.status})`
      );
    }
    throw new Error(
      `API submission failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Polls the API server for the status of a specific job.
 * @param jobId The job ID to check.
 * @returns The final job status response when the job completes or polling times out.
 * @throws If polling fails due to repeated errors or a fatal error like 404.
 */
const pollJobStatus = async (
  jobId: number
): Promise<JobStatusResponse | null> => {
  const jobIdStr = jobId.toString();
  const url = `${APP_API_SERVER_URL}/job/${jobId}`;
  let lastStatusResult: JobStatusResponse | null = null;

  console.log(
    `Starting status polling for job ID ${jobId} (Max ${MAX_POLLING_ATTEMPTS} attempts, ${
      POLLING_INTERVAL_MS / 1000
    }s interval)...`
  );

  for (let attempt = 1; attempt <= MAX_POLLING_ATTEMPTS; attempt++) {
    console.log(
      `Status check attempt ${attempt}/${MAX_POLLING_ATTEMPTS} for job ${jobId}...`
    );
    try {
      const jobIdSignature = await signMessage(jobIdStr); // Re-sign each time if required by API
      const headers = { "x-job-id-signature": jobIdSignature };

      const response = await axios.get<JobStatusResponse>(url, {
        headers,
        timeout: API_TIMEOUT_MS, // Use unified timeout
      });

      lastStatusResult = response.data;
      // Ensure status exists and handle potential case differences
      const status =
        typeof lastStatusResult?.status === "string"
          ? lastStatusResult.status.toLowerCase()
          : "unknown";
      console.log(`Job ${jobId} status: ${status}`);

      if (COMPLETED_JOB_STATUSES.has(status)) {
        console.log(
          `Job ${jobId} reached terminal status: ${status}. Stopping polling.`
        );
        return lastStatusResult; // Job finished
      }
    } catch (error) {
      console.error(
        `Status check attempt ${attempt} failed for job ${jobId}:`,
        error
      );
      if (axios.isAxiosError(error)) {
        logAxiosError(error, `API status check (GET ${url})`);
        // Stop polling immediately on 404 Not Found
        if (error.response?.status === 404) {
          console.error(
            `Job ID ${jobId} not found on API server (404). Stopping polling.`
          );
          throw new Error(`Job ${jobId} not found on API server.`);
        }
      }
      // If it's the last attempt and still failing, throw an error
      if (attempt === MAX_POLLING_ATTEMPTS) {
        console.error(
          `Max polling attempts reached for job ${jobId}. Last error: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        throw new Error(
          `Failed to get job status for ${jobId} after ${MAX_POLLING_ATTEMPTS} attempts.`
        );
      }
      // Otherwise, the loop will continue after the sleep interval
    }

    // Wait before the next attempt only if the job is not yet completed and it's not the last attempt
    if (attempt < MAX_POLLING_ATTEMPTS) {
      console.log(
        `Waiting ${POLLING_INTERVAL_MS / 1000}s before next check...`
      );
      await sleep(POLLING_INTERVAL_MS);
    }
  }

  // This part should theoretically not be reached if errors are thrown correctly on failure/timeout
  console.warn(
    `Polling for job ${jobId} exceeded max attempts (${MAX_POLLING_ATTEMPTS}) without reaching a completed status or throwing an error.`
  );
  return lastStatusResult; // Return the last known status
};

/**
 * Fetches artifact data from the provided URL.
 * @param jobId The job ID (used for signing the request).
 * @param artifactUrl The URL of the artifact to fetch.
 * @returns The fetched artifact data.
 * @throws If fetching fails or times out.
 */
const fetchArtifactData = async (jobId: number, artifactUrl: string) => {
  console.log(`Fetching artifact for job ${jobId} from ${artifactUrl}...`);
  const jobIdSignature = await signMessage(jobId.toString());
  const headers = { "x-job-id-signature": jobIdSignature };

  try {
    const response = await axios.get(artifactUrl, {
      headers,
      timeout: API_TIMEOUT_MS, // Use unified timeout
    });
    console.log(
      `Artifact data fetch successful (status ${response.status}) for job ${jobId}.`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch artifact from ${artifactUrl} for job ${jobId}:`,
      error
    );
    if (axios.isAxiosError(error)) {
      logAxiosError(error, `Artifact fetch (GET ${artifactUrl})`);
      throw new Error(
        `Artifact fetch error: ${error.message} (Status: ${error.response?.status})`
      );
    }
    throw new Error(
      `Artifact fetch failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Utility function to pause execution.
 * @param ms Milliseconds to sleep.
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Logs details from an AxiosError.
 * @param error The AxiosError object.
 * @param context A string describing the context of the error (e.g., API endpoint).
 */
const logAxiosError = (error: AxiosError, context: string): void => {
  console.error(`Axios error during ${context}:`);
  console.error(`  Message: ${error.message}`);
  if (error.response) {
    console.error(`  Status: ${error.response.status}`);
    console.error(`  Headers: ${JSON.stringify(error.response.headers)}`);
    // Avoid logging potentially large/sensitive response data by default
    console.error(
      `  Data: ${
        typeof error.response.data === "string"
          ? error.response.data.substring(0, 200) + "..."
          : "[Object/Non-string data]"
      }`
    );
  } else if (error.request) {
    console.error(
      "  No response received. Request details available in error object."
    );
  }
  if (error.config) {
    console.error(
      `  Request Config: Method=${error.config.method}, URL=${error.config.url}`
    );
  }
};

// Function to transform raw SQL results to the expected User format
const transformToUserFormat = (rawData: unknown[]): User[] => {
  return rawData.map((row) => {
    const typedRow = row as {
      userId?: string;
      email?: string;
      timestamp?: number | string;
      name?: string;
      locale?: string;
      percentUsed?: number | string | null;
      source?: string | null;
      collectionDate?: string | null;
      dataType?: string | null;
      [key: string]: unknown;
    };

    // Helper function to convert "None" to null
    const normalizeValue = <T>(value: T | string | undefined): T | null => {
      if (value === "None" || value === undefined) {
        return null;
      }
      return value as T;
    };

    return {
      userId: typedRow.userId || "",
      email: typedRow.email || "",
      timestamp: typedRow.timestamp || 0,
      profile: {
        name: typedRow.name || "",
        locale: typedRow.locale || "",
      },
      storage: {
        percentUsed: normalizeValue<number | string>(typedRow.percentUsed),
      },
      metadata: {
        source: normalizeValue<string>(typedRow.source),
        collectionDate: normalizeValue<string>(typedRow.collectionDate),
        dataType: normalizeValue<string>(typedRow.dataType),
      },
    };
  });
};

// --- Main API Route Handler (Cron Job Entry Point) ---
export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log("Cron job started: Submitting and monitoring compute job...");
  let jobId: number | undefined;

  try {
    // === Step 1: Submit job to the blockchain ===
    jobId = await submitJobToContract();
    console.log(`Blockchain job submission successful. Job ID: ${jobId}`);

    // === Step 2: Submit job details to the ===
    const apiSubmissionResult = await submitJobToApi(jobId);
    // Optional: Check apiSubmissionResult if needed, e.g., for initial status or run_id
    console.log(
      `API job submission successful. Run ID: ${
        apiSubmissionResult?.run_id || "N/A"
      }`
    );

    // === Step 3: Poll for job status ===
    const finalStatusResult = await pollJobStatus(jobId);

    // pollJobStatus now throws if it fails definitively (e.g., 404 or max attempts)
    // So, if we get here, finalStatusResult should contain the terminal status.
    // We still check defensively.
    if (!finalStatusResult || !finalStatusResult.status) {
      console.error(
        `Polling finished for job ${jobId} but a valid final status was not determined.`
      );
      return NextResponse.json(
        {
          success: false,
          jobId,
          error: "Polling completed without determining a valid final status.",
        },
        { status: 500 }
      );
    }

    const finalStatus = finalStatusResult.status.toLowerCase();
    console.log(
      `Polling complete for job ${jobId}. Final status: ${finalStatus}`
    );

    // === Step 4: Handle job completion (Fetch artifacts if successful) ===
    if (finalStatus === SUCCESS_STATUS) {
      console.log(`Job ${jobId} completed successfully.`);
      if (
        finalStatusResult.artifacts &&
        finalStatusResult.artifacts.length > 0
      ) {
        const artifact = finalStatusResult.artifacts[0]; // Process first artifact
        console.log(
          `Found artifact for job ${jobId}: ${artifact.name} at ${artifact.url}`
        );
        try {
          const artifactData = await fetchArtifactData(jobId, artifact.url);
          console.log(`Successfully fetched artifact data for job ${jobId}.`);

          // Transform the data to match the User interface
          const transformedData = Array.isArray(artifactData)
            ? transformToUserFormat(artifactData)
            : [];

          // Save the transformed data to Vercel Blob
          const { url } = await put('social-stats.json', JSON.stringify(transformedData, null, 2), { 
            access: 'public',
            addRandomSuffix: false // Use consistent name for easier retrieval
          });
          
          console.log(`Saved transformed artifact data to Vercel Blob at: ${url}`);
          console.log(`IMPORTANT: Add this URL to your .env.local as NEXT_PUBLIC_SOCIAL_STATS_BLOB_URL=${url}`);

          // Return success with status and artifact data
          return NextResponse.json({
            success: true,
            jobId,
            statusResult: finalStatusResult,
            artifactData: transformedData,
            blobUrl: url
          });
        } catch (artifactError) {
          console.error(
            `Failed to fetch artifact data for successful job ${jobId}:`,
            artifactError
          );
          // Return success (job completed) but indicate artifact failure
          return NextResponse.json({
            success: true,
            jobId,
            statusResult: finalStatusResult,
            error: `Job succeeded, but failed to fetch artifact: ${
              artifactError instanceof Error
                ? artifactError.message
                : String(artifactError)
            }`,
          });
        }
      } else {
        console.log(
          `Job ${jobId} completed successfully, but no artifacts were found.`
        );
        return NextResponse.json({
          success: true,
          jobId,
          statusResult: finalStatusResult,
          message: "Job succeeded, no artifacts.",
        });
      }
    } else {
      // Job finished but not successfully (failed, canceled, etc.)
      console.warn(
        `Job ${jobId} finished with non-success status: ${finalStatus}`
      );
      // Return success: false as the job itself didn't succeed
      return NextResponse.json({
        success: false,
        jobId,
        statusResult: finalStatusResult,
        error: `Job finished with status: ${finalStatus}`,
      });
    }
  } catch (error: unknown) {
    // Catch errors from any step (contract submission, API submission, polling failure, artifact fetch)
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `Unhandled error during cron job execution (Job ID: ${jobId ?? "N/A"}):`,
      errorMessage
    );
    console.error("Error details:", error); // Log the full error object for stack trace etc.

    return NextResponse.json(
      {
        success: false,
        jobId: jobId ?? "N/A",
        error: `Cron job failed: ${errorMessage}`,
      },
      { status: 500 } // Internal Server Error
    );
  } finally {
    console.log("Cron job execution finished.");
  }
}
