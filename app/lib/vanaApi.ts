import { ethers } from 'ethers';
import { JobCreatedResponse, JobCreationRequest, JobResultResponse } from '../types';

// Replace with actual private key in production or use environment variables
// This is just a placeholder for the demo
const PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000000';

// Test server URL
const TEST_SERVER_URL = 'http://34.56.88.201';

/**
 * Signs a message using the provided private key
 */
export const signMessage = async (message: string): Promise<string> => {
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const signature = await wallet.signMessage(message);
  return signature;
};

/**
 * Get wallet address from private key
 */
export const getWalletAddress = (): string => {
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  return wallet.address;
};

/**
 * Submit a job to the Vana Query Engine
 */
export const submitJob = async (
  jobId: number, 
  query: string, 
  refinerId: number = 1
): Promise<JobCreatedResponse> => {
  try {
    // Sign the job ID and query
    const jobIdSignature = await signMessage(jobId.toString());
    const querySignature = await signMessage(query);
    
    // Create job request payload
    const jobRequest: JobCreationRequest = {
      input: {
        query,
        query_signature: querySignature,
        params: [],
        refiner_id: refinerId
      }
    };
    
    // Set headers with job_id signature
    const headers = {
      'Content-Type': 'application/json',
      'x-job-id-signature': jobIdSignature
    };
    
    // Submit the job
    const url = `${TEST_SERVER_URL}/job/${jobId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(jobRequest),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error submitting job: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting job:', error);
    throw error;
  }
};

/**
 * Check the status of a job
 */
export const checkJobStatus = async (jobId: number): Promise<JobResultResponse> => {
  try {
    // Sign the job ID
    const jobIdSignature = await signMessage(jobId.toString());
    
    // Set headers with job_id signature
    const headers = {
      'x-job-id-signature': jobIdSignature
    };
    
    // Get job status
    const url = `${TEST_SERVER_URL}/job/${jobId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error checking job status: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking job status:', error);
    throw error;
  }
};

/**
 * Poll for job status until completed or failed
 */
export const pollJobStatus = async (
  jobId: number, 
  maxPolls: number = 10, 
  pollInterval: number = 2000
): Promise<JobResultResponse> => {
  let polls = 0;
  
  // Helper function to wait
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  while (polls < maxPolls) {
    const result = await checkJobStatus(jobId);
    
    // If job is complete or failed, return the result
    if (result.status === 'COMPLETED' || result.status === 'FAILED') {
      return result;
    }
    
    // Wait before next poll
    await wait(pollInterval);
    polls++;
  }
  
  throw new Error('Job polling timed out');
};

/**
 * Download an artifact from the job
 */
export const downloadArtifact = async (jobId: number, artifactId: string): Promise<Blob> => {
  try {
    // Sign the job ID
    const jobIdSignature = await signMessage(jobId.toString());
    
    // Set headers with job_id signature
    const headers = {
      'x-job-id-signature': jobIdSignature
    };
    
    // Get artifact
    const url = `${TEST_SERVER_URL}/job/${jobId}/artifacts/${artifactId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error downloading artifact: ${response.status} - ${errorText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error downloading artifact:', error);
    throw error;
  }
};

// Predefined queries for the views
export const PREDEFINED_QUERIES = {
  userProfiles: 'SELECT user_id, name, locale, created_at FROM users;',
  authStats: 'SELECT source, COUNT(*) as count FROM auth_sources GROUP BY source;',
  storageUsage: 'SELECT u.user_id, u.name, sm.percent_used, sm.recorded_at FROM users u LEFT JOIN storage_metrics sm ON u.user_id = sm.user_id WHERE sm.percent_used IS NOT NULL ORDER BY sm.percent_used DESC;'
}; 