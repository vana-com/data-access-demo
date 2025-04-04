import os
from app.services.tee_pool_service import tee_pool_service
from app.services.data_refiner_service import DataRefinerService
from app.services.job_service import job_service
from app.services.compute_instruction_service import ComputeInstructionService
from app.services.query_service import query_service
from app.utils.paths import ARTIFACTS_DIR
from app.stores import job_runs_store, artifacts_store
from app.utils.docker import get_image_cache
from fastapi import APIRouter, Depends, Header, HTTPException, Path, Request, Body
from fastapi.responses import FileResponse
from app.models.models import ArtifactStatus, ComputeEnvironment, ComputeUsage, JobCreatedResponse, JobCreationRequest, JobResultResponse, JobStatus
from app.services.auth_service import verify_signature
from datetime import datetime
from typing import Optional
import logging
logger = logging.getLogger(__name__)

# Create router
job_router = APIRouter(prefix="/job", tags=["job"])

# Dependency for authentication
async def verify_job_signature(
        request: Request,
        x_job_id_signature: str = Header(...)
):
    """
    Verify the job id signature and extract the requester's address.
    The signature should be a signed message of the job id.

    Args:
        request: The HTTP request containing the job id in the path
        x_job_id_signature: The signature of the job id

    Returns:
        The requester's Ethereum address
    """
    # Get the job id from the request path
    job_id = request.path_params.get("job_id")

    # Log the received signature for debugging
    logger.info(f"Received signature: {x_job_id_signature[:20]}...")
    logger.info(f"Verifying against job id: {job_id}...")

    # Verify the signature
    is_valid, address = verify_signature(x_job_id_signature, job_id)

    if not is_valid:
        raise HTTPException(status_code=403, detail=f"Access denied: Signature not from authorized wallet")

    return address

@job_router.post("/{job_id}",response_model=JobCreatedResponse)
async def submit_job(  
        job_id: int,
        job_request: JobCreationRequest,
        requester_address: str = Depends(verify_job_signature)
):
    """
    Submit a new job.

    The job will be executed once payment has been provided and the resulting artifacts stored for later retrieval.
    The response includes a job ID and payment information.
    """
    logger.info(f"Querying job with ID: {job_id}")
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' is not registered on-chain. Please register the job and then resubmit to the Compute Engine.")

    our_tee_address = os.getenv("TEE_ADDRESS", "")
    logger.info(f"Job {job_id} exists, checking TEE address {job.tee_address} against {our_tee_address}")
    if job.tee_address == "0x0000000000000000000000000000000000000000":
        raise HTTPException(status_code=400, detail=f"Job '{job_id}' is not assigned to a TEE on-chain. Please resubmit the job.")

    if job.tee_address != os.getenv("TEE_ADDRESS", ""):
        raise HTTPException(status_code=403, detail=f"Job assigned to other TEE '{job.tee_address}'")

    logger.info(f"Querying TEE with address: {job.tee_address}")
    tee = tee_pool_service.get_tee(job.tee_address)
    if not tee or tee.url != os.getenv("PUBLIC_URL", ""):
        raise HTTPException(status_code=403, detail=f"On-chain TEE url does not match our URL '{job.tee_address}'")

    logger.info(f"TEE is valid, checking job owner")
    if job.owner_address != requester_address:
        raise HTTPException(status_code=403, detail=f"Invalid job signature for registered job owner")

    logger.info(f"Job owner is valid, checking data refiner")
    refiner_service = DataRefinerService()
    refiner = refiner_service.get_data_refiner(job_request.input.refiner_id)

    if not refiner:
        raise HTTPException(status_code=404, detail=f"Data refiner '{job_request.input.refiner_id}' for the registered job '{job_id}' is not registered on-chain.")

    logger.info(f"Data refiner is valid, checking compute instruction: {job.compute_instruction_id}")
    instruction_service = ComputeInstructionService()
    instruction = instruction_service.get_compute_instruction(job.compute_instruction_id)

    if not instruction:
        raise HTTPException(status_code=422, detail="Invalid onchain compute instruction")

    logger.info(f"Compute instruction is valid, checking DLP approval: instruction {job.compute_instruction_id} for DLP {refiner.dlp_id}")
    is_approved = instruction_service.is_approved_for_dlp(job.compute_instruction_id, refiner.dlp_id)
    if not is_approved:
        raise HTTPException(status_code=401, detail="On-chain DLP owner approval required for compute job instructions")

    logger.info(f"DLP approval is valid, checking instruction image hash")
    instruction_image_cache = get_image_cache()
    instruction_image_hash = instruction_image_cache.get_image_sha256(instruction.image_url)
    logger.info(f"Computed instruction image hash: {instruction_image_hash}. Checking against {instruction.image_hash}")
    if instruction.image_hash != instruction_image_hash:
        logger.info(f"Image hash invalid, exiting")
        raise HTTPException(status_code=400, detail="Invalid instruction image")


    logger.info(f"Instruction image hash is valid, submitting query to query engine")
    query = query_service.submit_query(
        job_request.input.query,
        job_request.input.query_signature,
        job_request.input.params,
        job_request.input.refiner_id,
        job_id
    )

    logger.info(f"Query submitted, checking for errors")
    # TODO: Rework / extend, as it obfuscates what exactly went wrong to end users (bad gateway, service unavailable, ...)
    if query.error:
        logger.error(f"Query submission failed: {query.error}")
        raise HTTPException(status_code=500, detail="Query submission failed")

    logger.info(f"Query submission successful, submitting job for processing")
    # Submit the job to the job service for asynchronous processing
    run_id = await job_service.run_job(job, instruction.image_url)
    
    # Onchain status should already be "Submitted"
    logger.info(f"Job submitted to job service, returning response")
    return JobCreatedResponse(
        job_id=job_id,
        run_id=run_id,
        status=JobStatus.PENDING,
        created_at=datetime.now()
    )

@job_router.get("/{job_id}", response_model=JobResultResponse)
async def get_job_results(
        job_id: int,
        requester_address: str = Depends(verify_job_signature)
):
    """
    Get the results of a previously executed job.

    Results contain status information, compute usage, compute environment, and resulting artifact metadata.
    """
    logger.info(f"Getting job results for job {job_id}")
    job_owner = job_runs_store.get_job_owner(job_id)
    logger.info(f"Job owner: {job_owner}")

    if job_owner is None:
        logger.error(f"Job {job_id} owner not found")
        raise HTTPException(status_code=404, detail="Job  run not found")

    if job_owner != requester_address:
        logger.error(f"Job {job_id} owner mismatch: {job_owner} != {requester_address}")
        raise HTTPException(status_code=403, detail="Only the job owner can view the results")

    logger.info(f"Getting job result for job {job_id}")
    job_result = await job_service.get_job_result(job_id)

    logger.info(f"Job result: {job_result}")
    if not job_result:
        logger.info(f"Job result not found, getting job status")
        (job_status, job_error) = job_runs_store.get_job_status(job_id)
        logger.info(f"Job status: {job_status}")
        if job_status == JobStatus.NOT_FOUND:
            raise HTTPException(status_code=404, detail="Job not found")
        elif job_status == JobStatus.NO_RUNS:
            raise HTTPException(status_code=404, detail="No job runs found")
        elif job_status in [JobStatus.PENDING, JobStatus.QUEUED, JobStatus.RUNNING]:
            # Job is still processing
            logger.info(f"Job is still processing, returning partial result")
            return JobResultResponse(
                job_id=job_id,
                status=job_status,
                artifacts=[],
                # TODO: Measure real usage, default usage and compute values to satisfy Pydantic validation
                usage=ComputeUsage(
                    cpu_time_ms=0,
                    memory_mb=0,
                    duration_ms=0
                ),
                compute=ComputeEnvironment(
                    address="localhost",
                    region="local",
                    instance_type="local",
                    attestation="none"
                )
            )
        else:
            raise HTTPException(status_code=500, detail=f"Job failed: {job_error or 'Unknown error'}")
    
    logger.info(f"Job result found, returning")
    return job_result

@job_router.delete("/{job_id}", status_code=202)
async def cancel_job(
        job_id: int,
        run_id: Optional[str] = None,
        requester_address: str = Depends(verify_job_signature)
):
    """
    Cancel a running job.
    
    If no run_id is provided, cancels the latest run of the job.
    Returns 202 Accepted if the cancellation was accepted, 404 if the job was not found,
    or 409 if the job is not in a cancellable state.
    """
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' is not registered on-chain.")
    
    # Check if user has permission to cancel the job
    if job.owner_address != requester_address:
        raise HTTPException(status_code=403, detail="Only the job owner can cancel a job")
    
    # Attempt to cancel the job
    success = await job_service.cancel_job(job_id, run_id)
    
    if not success:
        # Check if job exists
        (status, error) = job_runs_store.get_job_status(job_id)
        if error:
            logger.warning(f"Job {job_id} run failed with error, cannot be cancelled: {error}")

        if status == JobStatus.NOT_FOUND:
            raise HTTPException(status_code=404, detail="Job not found")
        elif status == JobStatus.NO_RUNS:
            raise HTTPException(status_code=404, detail="No job runs found")
        else:
            # Job exists but couldn't be cancelled (likely already completed)
            raise HTTPException(
                status_code=409, 
                detail=f"Job cannot be cancelled: status is {status}"
            )
    
    return {"status": "cancellation_requested", "job_id": job_id, "run_id": run_id}

@job_router.get("/stats/concurrency", tags=["admin"])
async def get_job_concurrency_stats():
    """
    Get job processing statistics and concurrency information.
    
    This endpoint provides visibility into the current job queue and worker status.
    """
    return job_service.get_job_concurrency_stats()

# Add a health check endpoint
@job_router.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

## ARTIFACTS

@job_router.get("/{job_id}/artifacts/{artifact_id}", tags=["artifacts"])
async def get_artifact(
    job_id: int,
    artifact_id: str = Path(...),
    requester_address: str = Depends(verify_job_signature)
):
    """
    Get an artifact file by its path components.
    
    The artifact URL is structured as /artifacts/{job_id}/{artifact_id}.
    """
    artifact_data = artifacts_store.get_artifact(artifact_id)
    if not artifact_data:
        raise HTTPException(status_code=404, detail="Artifact not found")

    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' is not registered on-chain.")

    if job.owner_address != requester_address:
        raise HTTPException(status_code=403, detail="Only the job owner can download job artifacts")

    artifact_path = ARTIFACTS_DIR / job_id / artifact_data.run_id / f"{artifact_id}{artifact_data.file_extension}"

    if artifact_data.status == ArtifactStatus.EXPIRED:
        raise HTTPException(status_code=403, detail="Artifact is expired")

    if not artifact_path.exists():
        raise HTTPException(status_code=404, detail="Artifact not found")

    # Return file
    return FileResponse(
        path=str(artifact_path),
        filename=artifact_data.file_name,
        media_type=artifact_data.mimetype
    )