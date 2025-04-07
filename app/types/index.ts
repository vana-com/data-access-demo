// Types for the models based on the provided schema
export interface User {
  userId: string;
  email: string;
  timestamp: string;
  profile: {
    name: string;
    locale: string;
  };
  storage: {
    percentUsed: string | null;
  };
  metadata: {
    source: string | null;
    collectionDate: string;
    dataType: string;
  };
}

// This interface is kept for backward compatibility but is deprecated
export interface AuthSource {
  auth_id: number;
  user_id: string;
  source: string;
  collection_date: string;
  data_type: string;
}

export interface StorageMetric {
  metric_id: number;
  user_id: string;
  percent_used: number;
  recorded_at: string;
}

// User activity tracking
export interface UserActivity {
  user_id: string;
  name: string;
  last_login: string;
  login_count: number;
  is_active: boolean;
}

// Content upload tracking
export interface ContentUpload {
  upload_id: string;
  user_id: string;
  content_type: string;
  file_size_kb: number;
  upload_date: string;
  is_public: boolean;
}

// Locale usage statistics
export interface LocaleUsageStats {
  locale: string;
  user_count: number;
  average_storage_used: number;
  total_uploads: number;
}

// Types for UI state
export type ViewType = "userProfiles" | "storageWeb" | "storageTribe";

// Types for the Vana Query Engine API
export enum JobStatus {
  PENDING = "PENDING",
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  NOT_FOUND = "NOT_FOUND",
  NO_RUNS = "NO_RUNS",
}

export interface JobCreationRequest {
  input: {
    query: string;
    query_signature: string;
    params: unknown[];
    refiner_id: number;
  };
  webhook?: string;
}

export interface JobCreatedResponse {
  job_id: number;
  run_id: string;
  status: JobStatus;
  created_at: string;
}

export interface Artifact {
  id: string;
  file_name: string;
  file_extension: string;
  status: string;
  size_bytes: number;
  created_at: string;
  expires_at: string;
  mimetype: string;
}

export interface ComputeUsage {
  cpu_time_ms: number;
  memory_mb: number;
  duration_ms: number;
}

export interface ComputeEnvironment {
  address: string;
  region: string;
  instance_type: string;
  attestation: string;
}

// Define possible result types for JobResultResponse
export type JobResultData = User[] | null;

export interface JobResultResponse {
  job_id: number;
  status: JobStatus;
  artifacts: Artifact[];
  usage: ComputeUsage;
  compute: ComputeEnvironment;
  error?: string;
  result?: JobResultData;
}

// Auth Stats type
export interface AuthStat {
  source: string;
  count: number;
}

// Storage Usage type
export interface StorageUsageData {
  user_id: string;
  name: string;
  percent_used: number;
  recorded_at: string;
}
