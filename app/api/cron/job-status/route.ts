import { getAbi } from "@/contracts/abi";
import axios from "axios";
import { ethers } from "ethers";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

const PRIVATE_KEY = process.env.APP_WALLET_PRIVATE_KEY;
const TEST_SERVER_URL = "http://34.56.88.201";
const COMPLETED_STATUSES = ["completed", "failed", "canceled"];

// Contract address - would be better to get from environment variable
const COMPUTE_ENGINE_ADDRESS = "0x959C44c02c5ac8e3066319102b2Fc2412E15B6a8";

if (!PRIVATE_KEY) {
  throw new Error("APP_WALLET_PRIVATE_KEY environment variable is not set.");
}

const provider = new ethers.Wallet(
  PRIVATE_KEY,
  new ethers.JsonRpcProvider(
    process.env.RPC_URL || "https://rpc.moksha.vana.org"
  )
);

const signMessage = async (message: string): Promise<string> => {
  const signature = await provider.signMessage(message);
  return signature;
};

// Function to submit job to the smart contract
const submitJobToContract = async () => {
  const abi = getAbi("ComputeEngineProxy");

  try {
    // Create contract instance with ethers
    const contract = new ethers.Contract(COMPUTE_ENGINE_ADDRESS, abi, provider);

    // Submit job to the contract
    const maxTimeout = 100;
    const gpuRequired = false;
    const computeInstructionId = 11;
    const sendVana = ethers.parseEther("0.001"); // 1000 wei

    // Call submitJob function on the contract
    const tx = await contract.submitJob(
      maxTimeout,
      gpuRequired,
      computeInstructionId,
      { value: sendVana }
    );

    console.log(`Contract job submission transaction: ${tx.hash}`);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Get JobRegistered event from the receipt
    const jobRegisteredEvent = receipt.logs
      .map((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === "JobRegistered" ? parsed : null;
        } catch {
          return null;
        }
      })
      .find(Boolean);

    if (!jobRegisteredEvent || !jobRegisteredEvent.args[0]) {
      throw new Error(
        "Job creation failed: Could not find JobRegistered event"
      );
    }

    // Extract jobId from the event
    const jobId = Number(jobRegisteredEvent.args[0]);
    console.log(`Registered job ID: ${jobId}`);

    return jobId;
  } catch (error) {
    console.error("Error submitting job to contract:", error);
    throw new Error(
      `Failed to create job: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const submitJob = async (jobId: number) => {
  const sqlQuery = `SELECT name FROM users LIMIT 1;`;
  const jobIdStr = jobId.toString();

  console.log(`Signing job ID ${jobIdStr}...`);
  const jobIdSignature = await signMessage(jobIdStr);
  console.log(`Signing SQL query...`);
  const querySignature = await signMessage(sqlQuery);

  const jobRequest = {
    input: {
      query: sqlQuery,
      query_signature: querySignature,
      params: [],
      refiner_id: 4,
    },
    webhook: "https://xyz.com/webhook",
  };

  const headers = {
    "Content-Type": "application/json",
    "x-job-id-signature": jobIdSignature,
  };

  console.log(`Sending POST request to ${TEST_SERVER_URL}/job/${jobId}...`);
  try {
    const response = await axios.post(
      `${TEST_SERVER_URL}/job/${jobId}`,
      jobRequest,
      {
        headers,
        timeout: 15000, // 15 second timeout
      }
    );
    console.log(`POST request successful, status: ${response.status}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `HTTP error: ${error.message}, status: ${
          error.response?.status
        }, data: ${JSON.stringify(error.response?.data || {})}`
      );
    }
    throw error;
  }
};

const checkJobStatus = async (jobId: number) => {
  console.log(`Signing job ID ${jobId} for status check...`);
  const jobIdSignature = await signMessage(jobId.toString());

  const headers = {
    "x-job-id-signature": jobIdSignature,
  };

  console.log(`Sending GET request to ${TEST_SERVER_URL}/job/${jobId}...`);
  try {
    const response = await axios.get(`${TEST_SERVER_URL}/job/${jobId}`, {
      headers,
      timeout: 15000, // 15 second timeout
    });
    console.log(`GET request successful, status: ${response.status}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `HTTP error: ${error.message}, status: ${
          error.response?.status
        }, data: ${JSON.stringify(error.response?.data || {})}`
      );
    }
    throw error;
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// This is the cron job that runs on the schedule defined in the export config
export async function GET() {
  try {
    // First submit job to the blockchain
    console.log("Starting job submission to blockchain...");
    let jobId;
    try {
      jobId = await submitJobToContract();
    } catch (contractError) {
      console.error("Blockchain job submission failed:", contractError);
      return NextResponse.json(
        {
          error: `Blockchain job creation failed: ${
            contractError instanceof Error
              ? contractError.message
              : String(contractError)
          }`,
        },
        { status: 500 }
      );
    }

    console.log(`Got job ID ${jobId}, now submitting to API server...`);

    // Then submit to the API server with timeout protection
    let jobResult;
    try {
      jobResult = await Promise.race([
        submitJob(jobId),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("API submission timeout after 10s")),
            10000
          )
        ),
      ]);
      console.log(
        "API submission successful:",
        JSON.stringify(jobResult).substring(0, 100) + "..."
      );
    } catch (submitError) {
      console.error("API submission failed:", submitError);
      return NextResponse.json(
        {
          error: `API submission failed: ${
            submitError instanceof Error
              ? submitError.message
              : String(submitError)
          }`,
        },
        { status: 500 }
      );
    }

    if (!jobResult?.run_id) {
      const error = "Job submission failed or run_id missing.";
      console.error(error);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log(`Got run_id: ${jobResult.run_id}, starting status polling...`);

    // Poll for status with explicit timeout on each request
    let statusResult = null;
    for (let i = 0; i < 15; i++) {
      console.log(`Status check attempt ${i + 1}/15...`);
      try {
        statusResult = await Promise.race([
          checkJobStatus(jobId),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Status check timeout after 5s")),
              5000
            )
          ),
        ]);
        console.log(`Status: ${statusResult.status}`);
      } catch (statusError) {
        console.error(`Status check failed:`, statusError);
        break;
      }

      const status = statusResult.status;
      if (COMPLETED_STATUSES.includes(status)) {
        console.log(`Job completed with status: ${status}`);
        break;
      }

      console.log(`Waiting 10s before next status check...`);
      await sleep(10_000); // wait 10 seconds
    }

    // Only save results to file if status is "success"
    if (statusResult && statusResult.status === "success") {
      console.log("Saving results to file...");
      const outputPath = path.join(
        process.cwd(),
        "export",
        "social-stats.json"
      );
      fs.writeFileSync(outputPath, JSON.stringify(statusResult, null, 2));
      console.log("Results saved, returning response");
    } else {
      console.log(
        `Not saving results: status is ${statusResult?.status || "unknown"}`
      );
    }

    return NextResponse.json({ success: true, jobId, statusResult });
  } catch (error: unknown) {
    console.error(
      "Error during job execution:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
