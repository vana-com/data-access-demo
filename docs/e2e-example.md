import os
import sys
import requests
import json
import time
from eth_account import Account
from eth_account.messages import encode_defunct
from dotenv import load_dotenv
from app.models.models import JobStatus

# Load environment variables from .env file
load_dotenv()

# Get private key from environment variables
PRIVATE_KEY = os.getenv("APP_WALLET_PRIVATE_KEY")
if not PRIVATE_KEY:
    print("Error: APP_WALLET_PRIVATE_KEY environment variable is not set")
    sys.exit(1)

# Test server URL
TEST_SERVER_URL = "http://34.56.88.201"

def sign_message(message, private_key):
    """Sign a message using the provided private key."""
    account = Account.from_key(private_key)
    message_hash = encode_defunct(text=message)
    signed_message = account.sign_message(message_hash)
    return signed_message.signature.hex()

def get_account_address(private_key):
    """Get the Ethereum address from a private key."""
    account = Account.from_key(private_key)
    return account.address

def submit_job(job_id, refiner_id=1):
    """Submit a job to the test server."""
    # The SQL query to run
    # sql_query = """
    # SELECT
    #     u.user_id,
    #     u.locale,
    #     a.source AS auth_source,
    #     a.data_type AS auth_data_type,
    #     sm.metric_id AS storage_metric_id
    # FROM users AS u
    # LEFT JOIN auth_sources AS a ON a.user_id = u.user_id
    # LEFT JOIN storage_metrics AS sm ON sm.user_id = u.user_id; 
    # """
    sql_query = """
    SELECT
        user_id
    FROM users
    """
    
    # Convert job_id to string for signing
    job_id_str = str(job_id)
    
    # Generate signatures
    job_id_signature = sign_message(job_id_str, PRIVATE_KEY)
    query_signature = sign_message(sql_query, PRIVATE_KEY)
    
    # Create job request payload
    job_request = {
        "input": {
            "query": sql_query,
            "query_signature": query_signature,
            "params": [],  # Add parameters if needed
            "refiner_id": refiner_id
        },
        # TODO: Remove
        "webhook": "https://xyz.com/webhook"
    }
    
    # Set headers with job_id signature
    headers = {
        "Content-Type": "application/json",
        "x-job-id-signature": job_id_signature
    }
    
    # Submit the job
    url = f"{TEST_SERVER_URL}/job/{job_id}"
    print(f"Submitting job to {url}")
    
    try:
        response = requests.post(url, headers=headers, json=job_request)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error submitting job: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response content: {e.response.text}")
        return None

def check_job_status(job_id):
    """Check the status of a job."""
    # Generate signature for job_id
    job_id_str = str(job_id)
    job_id_signature = sign_message(job_id_str, PRIVATE_KEY)
    
    # Set headers with job_id signature
    headers = {
        "x-job-id-signature": job_id_signature
    }
    
    # Get job status
    url = f"{TEST_SERVER_URL}/job/{job_id}"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error checking job status: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response content: {e.response.text}")
        return None

def run_e2e_test():
    """Run the end-to-end test."""
    # Print the Ethereum address we're using
    address = get_account_address(PRIVATE_KEY)
    print(f"Using Ethereum address: {address}")
    
    # Define a job ID (this should be registered on-chain)
    job_id = 11
    
    # Submit the job
    print(f"Submitting job with ID: {job_id}")
    job_result = submit_job(job_id)
    
    if not job_result:
        print("Job submission failed")
        return
    
    print(f"Job submitted successfully: {json.dumps(job_result, indent=2)}")
    
    # Check job status (optional, depends on processing time)
    run_id = job_result.get("run_id")
    print(f"Job run ID: {run_id}")
    
    # Poll for job status a few times
    print("Polling for job status...")
    max_polls = 5
    poll_interval = 10  # seconds
    
    for i in range(max_polls):
        print(f"Poll {i+1}/{max_polls}...")
        status_result = check_job_status(job_id)
        
        if not status_result:
            print("Failed to get job status")
            break
        
        print(f"Job status: {json.dumps(status_result, indent=2)}")
        
        # If job is complete, break out of the loop
        if status_result.get("status") not in [JobStatus.PENDING, JobStatus.QUEUED, JobStatus.RUNNING]:
            print("Job completed")
            break
        
        # Wait before next poll
        if i < max_polls - 1:
            print(f"Waiting {poll_interval} seconds before next poll...")
            time.sleep(poll_interval)

if __name__ == "__main__":
    run_e2e_test()