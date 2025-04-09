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

// Types for UI state
export type ViewType = "userProfiles" | "storageWeb";
