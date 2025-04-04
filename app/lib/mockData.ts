import {
  User,
  AuthSource,
  StorageMetric,
  AuthStat,
  StorageUsageData,
  JobStatus,
  JobResultResponse,
  JobResultData,
  UserActivity,
  ContentUpload,
  LocaleUsageStats,
} from "../types";

// Mock user profiles
export const mockUsers: User[] = [
  {
    user_id: "001",
    name: "John Doe",
    locale: "en-US",
    created_at: "2023-01-15T10:30:00Z",
  },
  {
    user_id: "002",
    name: "Jane Smith",
    locale: "en-GB",
    created_at: "2023-02-20T08:45:00Z",
  },
  {
    user_id: "003",
    name: "Carlos Rodriguez",
    locale: "es-ES",
    created_at: "2023-03-05T14:20:00Z",
  },
  {
    user_id: "004",
    name: "Emma Wilson",
    locale: "en-AU",
    created_at: "2023-01-28T11:10:00Z",
  },
  {
    user_id: "005",
    name: "Yuki Tanaka",
    locale: "ja-JP",
    created_at: "2023-02-10T09:15:00Z",
  },
  {
    user_id: "006",
    name: "Marie Dupont",
    locale: "fr-FR",
    created_at: "2023-03-18T16:40:00Z",
  },
  {
    user_id: "007",
    name: "Wei Chen",
    locale: "zh-CN",
    created_at: "2023-02-05T13:25:00Z",
  },
  {
    user_id: "008",
    name: "Sophia Müller",
    locale: "de-DE",
    created_at: "2023-01-20T07:55:00Z",
  },
  {
    user_id: "009",
    name: "Lucas Silva",
    locale: "pt-BR",
    created_at: "2023-03-10T15:30:00Z",
  },
  {
    user_id: "010",
    name: "Olivia Brown",
    locale: "en-CA",
    created_at: "2023-02-15T12:05:00Z",
  },
  // Additional mock users
  {
    user_id: "011",
    name: "Raj Patel",
    locale: "en-IN",
    created_at: "2023-04-05T09:20:00Z",
  },
  {
    user_id: "012",
    name: "Anna Kowalski",
    locale: "pl-PL",
    created_at: "2023-03-22T14:10:00Z",
  },
  {
    user_id: "013",
    name: "Hiroshi Yamamoto",
    locale: "ja-JP",
    created_at: "2023-04-15T08:30:00Z",
  },
  {
    user_id: "014",
    name: "Fatima Al-Farsi",
    locale: "ar-SA",
    created_at: "2023-02-28T11:45:00Z",
  },
  {
    user_id: "015",
    name: "Kim Min-Ji",
    locale: "ko-KR",
    created_at: "2023-03-30T16:20:00Z",
  },
  // More users with repeated locales
  {
    user_id: "016",
    name: "Michael Johnson",
    locale: "en-US",
    created_at: "2023-01-25T15:40:00Z",
  },
  {
    user_id: "017",
    name: "Sarah Williams",
    locale: "en-US",
    created_at: "2023-02-12T11:25:00Z",
  },
  {
    user_id: "018",
    name: "David Thompson",
    locale: "en-GB",
    created_at: "2023-03-18T09:35:00Z",
  },
  {
    user_id: "019",
    name: "Emily Davis",
    locale: "en-GB",
    created_at: "2023-01-30T17:15:00Z",
  },
  {
    user_id: "020",
    name: "Pedro Sanchez",
    locale: "es-ES",
    created_at: "2023-02-22T13:50:00Z",
  },
  {
    user_id: "021",
    name: "Sofia Garcia",
    locale: "es-ES",
    created_at: "2023-03-27T10:10:00Z",
  },
  {
    user_id: "022",
    name: "Kenji Sato",
    locale: "ja-JP",
    created_at: "2023-01-08T08:05:00Z",
  },
  {
    user_id: "023",
    name: "Aiko Nakamura",
    locale: "ja-JP",
    created_at: "2023-02-18T14:30:00Z",
  },
  {
    user_id: "024",
    name: "Jean Petit",
    locale: "fr-FR",
    created_at: "2023-03-14T12:25:00Z",
  },
  {
    user_id: "025",
    name: "Sophie Martin",
    locale: "fr-FR",
    created_at: "2023-01-22T16:45:00Z",
  },
  {
    user_id: "026",
    name: "Li Wei",
    locale: "zh-CN",
    created_at: "2023-02-27T09:05:00Z",
  },
  {
    user_id: "027",
    name: "Zhang Min",
    locale: "zh-CN",
    created_at: "2023-03-09T11:40:00Z",
  },
  {
    user_id: "028",
    name: "Thomas Weber",
    locale: "de-DE",
    created_at: "2023-01-17T15:20:00Z",
  },
  {
    user_id: "029",
    name: "Hannah Schmidt",
    locale: "de-DE",
    created_at: "2023-02-09T10:15:00Z",
  },
  {
    user_id: "030",
    name: "Mateus Oliveira",
    locale: "pt-BR",
    created_at: "2023-03-24T13:35:00Z",
  },
];

// Mock authentication sources
export const mockAuthSources: AuthSource[] = [
  {
    auth_id: 1,
    user_id: "001",
    source: "Google",
    collection_date: "2023-01-15T10:35:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 2,
    user_id: "002",
    source: "Facebook",
    collection_date: "2023-02-20T08:50:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 3,
    user_id: "003",
    source: "Twitter",
    collection_date: "2023-03-05T14:25:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 4,
    user_id: "004",
    source: "Apple",
    collection_date: "2023-01-28T11:15:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 5,
    user_id: "005",
    source: "Google",
    collection_date: "2023-02-10T09:20:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 6,
    user_id: "006",
    source: "Facebook",
    collection_date: "2023-03-18T16:45:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 7,
    user_id: "007",
    source: "Apple",
    collection_date: "2023-02-05T13:30:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 8,
    user_id: "008",
    source: "GitHub",
    collection_date: "2023-01-20T08:00:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 9,
    user_id: "009",
    source: "Google",
    collection_date: "2023-03-10T15:35:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 10,
    user_id: "010",
    source: "Twitter",
    collection_date: "2023-02-15T12:10:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 11,
    user_id: "001",
    source: "GitHub",
    collection_date: "2023-01-16T14:20:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 12,
    user_id: "003",
    source: "Google",
    collection_date: "2023-03-06T10:15:00Z",
    data_type: "oauth",
  },
  // Additional mock auth sources
  {
    auth_id: 13,
    user_id: "011",
    source: "LinkedIn",
    collection_date: "2023-04-05T09:25:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 14,
    user_id: "012",
    source: "Google",
    collection_date: "2023-03-22T14:15:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 15,
    user_id: "013",
    source: "Apple",
    collection_date: "2023-04-15T08:35:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 16,
    user_id: "014",
    source: "Facebook",
    collection_date: "2023-02-28T11:50:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 17,
    user_id: "015",
    source: "Instagram",
    collection_date: "2023-03-30T16:25:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 18,
    user_id: "011",
    source: "GitHub",
    collection_date: "2023-04-06T11:10:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 19,
    user_id: "013",
    source: "Twitter",
    collection_date: "2023-04-16T09:45:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 20,
    user_id: "015",
    source: "Google",
    collection_date: "2023-03-31T10:20:00Z",
    data_type: "oauth",
  },
  // Auth sources for new users
  {
    auth_id: 21,
    user_id: "016",
    source: "Google",
    collection_date: "2023-01-25T15:45:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 22,
    user_id: "017",
    source: "Facebook",
    collection_date: "2023-02-12T11:30:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 23,
    user_id: "018",
    source: "Twitter",
    collection_date: "2023-03-18T09:40:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 24,
    user_id: "019",
    source: "LinkedIn",
    collection_date: "2023-01-30T17:20:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 25,
    user_id: "020",
    source: "Google",
    collection_date: "2023-02-22T13:55:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 26,
    user_id: "021",
    source: "Instagram",
    collection_date: "2023-03-27T10:15:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 27,
    user_id: "022",
    source: "Apple",
    collection_date: "2023-01-08T08:10:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 28,
    user_id: "023",
    source: "TikTok",
    collection_date: "2023-02-18T14:35:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 29,
    user_id: "024",
    source: "Facebook",
    collection_date: "2023-03-14T12:30:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 30,
    user_id: "025",
    source: "Twitter",
    collection_date: "2023-01-22T16:50:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 31,
    user_id: "027",
    source: "Google",
    collection_date: "2023-03-09T11:45:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 32,
    user_id: "028",
    source: "GitHub",
    collection_date: "2023-01-17T15:25:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 33,
    user_id: "029",
    source: "Apple",
    collection_date: "2023-02-09T10:20:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 34,
    user_id: "030",
    source: "Instagram",
    collection_date: "2023-03-24T13:40:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 35,
    user_id: "016",
    source: "GitHub",
    collection_date: "2023-01-26T09:15:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 37,
    user_id: "020",
    source: "Apple",
    collection_date: "2023-02-23T15:30:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 38,
    user_id: "025",
    source: "LinkedIn",
    collection_date: "2023-01-23T12:40:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 39,
    user_id: "028",
    source: "Facebook",
    collection_date: "2023-01-18T16:55:00Z",
    data_type: "oauth",
  },
  {
    auth_id: 40,
    user_id: "030",
    source: "TikTok",
    collection_date: "2023-03-25T10:25:00Z",
    data_type: "oauth",
  },
];

// Mock storage metrics
export const mockStorageMetrics: StorageMetric[] = [
  {
    metric_id: 1,
    user_id: "001",
    percent_used: 75.2,
    recorded_at: "2023-04-01T10:00:00Z",
  },
  {
    metric_id: 2,
    user_id: "002",
    percent_used: 42.8,
    recorded_at: "2023-04-01T10:05:00Z",
  },
  {
    metric_id: 3,
    user_id: "003",
    percent_used: 91.5,
    recorded_at: "2023-04-01T10:10:00Z",
  },
  {
    metric_id: 4,
    user_id: "004",
    percent_used: 12.3,
    recorded_at: "2023-04-01T10:15:00Z",
  },
  {
    metric_id: 5,
    user_id: "005",
    percent_used: 67.9,
    recorded_at: "2023-04-01T10:20:00Z",
  },
  {
    metric_id: 6,
    user_id: "006",
    percent_used: 33.1,
    recorded_at: "2023-04-01T10:25:00Z",
  },
  {
    metric_id: 7,
    user_id: "007",
    percent_used: 88.7,
    recorded_at: "2023-04-01T10:30:00Z",
  },
  {
    metric_id: 8,
    user_id: "008",
    percent_used: 55.4,
    recorded_at: "2023-04-01T10:35:00Z",
  },
  {
    metric_id: 9,
    user_id: "009",
    percent_used: 29.6,
    recorded_at: "2023-04-01T10:40:00Z",
  },
  {
    metric_id: 10,
    user_id: "010",
    percent_used: 63.8,
    recorded_at: "2023-04-01T10:45:00Z",
  },
  // Additional mock storage metrics
  {
    metric_id: 11,
    user_id: "011",
    percent_used: 82.3,
    recorded_at: "2023-04-01T10:50:00Z",
  },
  {
    metric_id: 12,
    user_id: "012",
    percent_used: 37.9,
    recorded_at: "2023-04-01T10:55:00Z",
  },
  {
    metric_id: 13,
    user_id: "013",
    percent_used: 94.7,
    recorded_at: "2023-04-01T11:00:00Z",
  },
  {
    metric_id: 14,
    user_id: "014",
    percent_used: 23.5,
    recorded_at: "2023-04-01T11:05:00Z",
  },
  {
    metric_id: 15,
    user_id: "015",
    percent_used: 76.2,
    recorded_at: "2023-04-01T11:10:00Z",
  },
  // Storage metrics for new users
  {
    metric_id: 16,
    user_id: "016",
    percent_used: 58.7,
    recorded_at: "2023-04-01T11:15:00Z",
  },
  {
    metric_id: 17,
    user_id: "017",
    percent_used: 45.2,
    recorded_at: "2023-04-01T11:20:00Z",
  },
  {
    metric_id: 18,
    user_id: "018",
    percent_used: 87.4,
    recorded_at: "2023-04-01T11:25:00Z",
  },
  {
    metric_id: 19,
    user_id: "019",
    percent_used: 32.8,
    recorded_at: "2023-04-01T11:30:00Z",
  },
  {
    metric_id: 20,
    user_id: "020",
    percent_used: 73.6,
    recorded_at: "2023-04-01T11:35:00Z",
  },
  {
    metric_id: 21,
    user_id: "021",
    percent_used: 61.9,
    recorded_at: "2023-04-01T11:40:00Z",
  },
  {
    metric_id: 22,
    user_id: "022",
    percent_used: 92.3,
    recorded_at: "2023-04-01T11:45:00Z",
  },
  {
    metric_id: 23,
    user_id: "023",
    percent_used: 39.7,
    recorded_at: "2023-04-01T11:50:00Z",
  },
  {
    metric_id: 24,
    user_id: "024",
    percent_used: 85.1,
    recorded_at: "2023-04-01T11:55:00Z",
  },
  {
    metric_id: 25,
    user_id: "025",
    percent_used: 27.4,
    recorded_at: "2023-04-01T12:00:00Z",
  },
  {
    metric_id: 26,
    user_id: "026",
    percent_used: 68.5,
    recorded_at: "2023-04-01T12:05:00Z",
  },
  {
    metric_id: 27,
    user_id: "027",
    percent_used: 53.2,
    recorded_at: "2023-04-01T12:10:00Z",
  },
  {
    metric_id: 28,
    user_id: "028",
    percent_used: 79.8,
    recorded_at: "2023-04-01T12:15:00Z",
  },
  {
    metric_id: 29,
    user_id: "029",
    percent_used: 41.6,
    recorded_at: "2023-04-01T12:20:00Z",
  },
  {
    metric_id: 30,
    user_id: "030",
    percent_used: 95.2,
    recorded_at: "2023-04-01T12:25:00Z",
  },
];

// Mock authentication stats (aggregated)
export const mockAuthStats: AuthStat[] = [
  { source: "Google", count: 10 },
  { source: "Facebook", count: 6 },
  { source: "Twitter", count: 5 },
  { source: "Apple", count: 6 },
  { source: "GitHub", count: 6 },
  { source: "LinkedIn", count: 3 },
  { source: "Instagram", count: 3 },
  { source: "TikTok", count: 2 },
  { source: "WeChat", count: 1 },
];

// Content uploads
export const mockContentUploads: ContentUpload[] = [
  {
    upload_id: "up-001",
    user_id: "001",
    content_type: "image/jpeg",
    file_size_kb: 1240,
    upload_date: "2023-03-15T09:20:00Z",
    is_public: true,
  },
  {
    upload_id: "up-002",
    user_id: "003",
    content_type: "image/png",
    file_size_kb: 890,
    upload_date: "2023-03-16T14:30:00Z",
    is_public: true,
  },
  {
    upload_id: "up-003",
    user_id: "005",
    content_type: "video/mp4",
    file_size_kb: 15600,
    upload_date: "2023-03-17T11:45:00Z",
    is_public: false,
  },
  {
    upload_id: "up-004",
    user_id: "007",
    content_type: "audio/mp3",
    file_size_kb: 5200,
    upload_date: "2023-03-18T16:10:00Z",
    is_public: true,
  },
  {
    upload_id: "up-005",
    user_id: "009",
    content_type: "application/pdf",
    file_size_kb: 720,
    upload_date: "2023-03-19T10:25:00Z",
    is_public: false,
  },
  {
    upload_id: "up-006",
    user_id: "011",
    content_type: "image/jpeg",
    file_size_kb: 950,
    upload_date: "2023-03-20T13:40:00Z",
    is_public: true,
  },
  {
    upload_id: "up-007",
    user_id: "013",
    content_type: "video/mp4",
    file_size_kb: 24800,
    upload_date: "2023-03-21T15:50:00Z",
    is_public: true,
  },
  {
    upload_id: "up-008",
    user_id: "015",
    content_type: "audio/wav",
    file_size_kb: 12300,
    upload_date: "2023-03-22T09:15:00Z",
    is_public: false,
  },
  {
    upload_id: "up-009",
    user_id: "017",
    content_type: "image/png",
    file_size_kb: 670,
    upload_date: "2023-03-23T11:30:00Z",
    is_public: true,
  },
  {
    upload_id: "up-010",
    user_id: "019",
    content_type: "application/pdf",
    file_size_kb: 1450,
    upload_date: "2023-03-24T14:20:00Z",
    is_public: false,
  },
  {
    upload_id: "up-011",
    user_id: "021",
    content_type: "image/jpeg",
    file_size_kb: 880,
    upload_date: "2023-03-25T10:10:00Z",
    is_public: true,
  },
  {
    upload_id: "up-012",
    user_id: "023",
    content_type: "video/mp4",
    file_size_kb: 18200,
    upload_date: "2023-03-26T16:40:00Z",
    is_public: true,
  },
  {
    upload_id: "up-013",
    user_id: "025",
    content_type: "audio/mp3",
    file_size_kb: 6800,
    upload_date: "2023-03-27T13:15:00Z",
    is_public: false,
  },
  {
    upload_id: "up-014",
    user_id: "027",
    content_type: "image/png",
    file_size_kb: 580,
    upload_date: "2023-03-28T09:30:00Z",
    is_public: true,
  },
  {
    upload_id: "up-015",
    user_id: "029",
    content_type: "application/pdf",
    file_size_kb: 930,
    upload_date: "2023-03-29T11:55:00Z",
    is_public: false,
  },
];

// Calculate locale stats from our data
const calculateLocaleStats = (): LocaleUsageStats[] => {
  const localeMap = new Map<
    string,
    { count: number; totalStorage: number; uploads: number }
  >();

  // Count users per locale
  mockUsers.forEach((user) => {
    const stats = localeMap.get(user.locale) || {
      count: 0,
      totalStorage: 0,
      uploads: 0,
    };
    stats.count += 1;

    // Find storage for this user
    const storage = mockStorageMetrics.find((m) => m.user_id === user.user_id);
    if (storage) {
      stats.totalStorage += storage.percent_used;
    }

    // Count uploads
    const userUploads = mockContentUploads.filter(
      (u) => u.user_id === user.user_id
    ).length;
    stats.uploads += userUploads;

    localeMap.set(user.locale, stats);
  });

  // Convert to array of stats
  return Array.from(localeMap.entries()).map(([locale, stats]) => ({
    locale,
    user_count: stats.count,
    average_storage_used:
      stats.count > 0
        ? parseFloat((stats.totalStorage / stats.count).toFixed(1))
        : 0,
    total_uploads: stats.uploads,
  }));
};

export const mockLocaleStats: LocaleUsageStats[] = calculateLocaleStats();

// Mock storage usage data (joined with users)
export const mockStorageUsageData: StorageUsageData[] = mockStorageMetrics
  .map((metric) => {
    const user = mockUsers.find((u) => u.user_id === metric.user_id)!;
    return {
      user_id: metric.user_id,
      name: user.name,
      percent_used: metric.percent_used,
      recorded_at: metric.recorded_at,
    };
  })
  .sort((a, b) => b.percent_used - a.percent_used);

// Additional mock data types
export const mockUserActivity: UserActivity[] = mockUsers.map((user) => {
  const lastLogin = new Date(user.created_at);
  lastLogin.setDate(lastLogin.getDate() + Math.floor(Math.random() * 30));

  return {
    user_id: user.user_id,
    name: user.name,
    last_login: lastLogin.toISOString(),
    login_count: Math.floor(Math.random() * 50) + 1,
    is_active: Math.random() > 0.2,
  };
});

// Helper to create mock job results
export const createMockJobResult = (
  jobId: number,
  status: JobStatus,
  data?: JobResultData
): JobResultResponse => {
  const now = new Date();
  const oneHour = 60 * 60 * 1000;

  console.log(
    `Creating mock job result for job ${jobId} with status ${status} and data:`,
    data
  );

  return {
    job_id: jobId,
    status,
    artifacts: data
      ? [
          {
            id: `artifact-${jobId}`,
            file_name: `result-${jobId}.json`,
            file_extension: ".json",
            status: "AVAILABLE",
            size_bytes: 1024,
            created_at: now.toISOString(),
            expires_at: new Date(now.getTime() + oneHour).toISOString(),
            mimetype: "application/json",
          },
        ]
      : [],
    usage: {
      cpu_time_ms: 1500,
      memory_mb: 256,
      duration_ms: 2000,
    },
    compute: {
      address: "localhost",
      region: "demo-region",
      instance_type: "demo-instance",
      attestation: "none",
    },
    result: data,
  };
};

// Make sure we're using the string values from JobStatus enum
export const mockJobResultsMap = {
  userProfiles: createMockJobResult(1, JobStatus.COMPLETED, mockUsers),
  authStats: createMockJobResult(2, JobStatus.COMPLETED, mockAuthStats),
  storageUsage: createMockJobResult(
    3,
    JobStatus.COMPLETED,
    mockStorageUsageData
  ),
  userActivity: createMockJobResult(4, JobStatus.COMPLETED, mockUserActivity),
  contentUploads: createMockJobResult(
    5,
    JobStatus.COMPLETED,
    mockContentUploads
  ),
  localeStats: createMockJobResult(6, JobStatus.COMPLETED, mockLocaleStats),
};
