import { create } from 'zustand';
import { ViewType, JobResultResponse, User, AuthStat, StorageUsageData } from '../types';
import { submitJob, pollJobStatus, PREDEFINED_QUERIES } from '../lib/vanaApi';
import { mockJobResultsMap } from '../lib/mockData';

// Define the store type
interface AppState {
  // Current view state
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
  
  // Job IDs for different views
  jobIds: Record<ViewType, number>;
  
  // Job results
  jobResults: Record<ViewType, JobResultResponse | null>;
  setJobResult: (view: ViewType, result: JobResultResponse | null) => void;
  
  // Data selectors
  userProfiles: User[] | null;
  authStats: AuthStat[] | null;
  storageUsage: StorageUsageData[] | null;
  
  // Actions
  fetchData: (view: ViewType, useMockData?: boolean) => Promise<void>;
  clearData: (view: ViewType) => void;
  clearAllData: () => void;
}

// Create the store
export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentView: 'userProfiles',
  isLoading: false,
  error: null,
  
  // Initial job IDs for each view (hardcoded for demo)
  jobIds: {
    userProfiles: 1,
    authStats: 2,
    storageUsage: 3,
    socialWeb: 4,
    storageTribe: 5
  },
  
  // Initial job results
  jobResults: {
    userProfiles: null,
    authStats: null,
    storageUsage: null,
    socialWeb: null,
    storageTribe: null
  },
  
  // Action to set current view
  setCurrentView: (view) => set({ currentView: view }),
  
  // Action to set loading state
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Action to set error state
  setError: (error) => set({ error }),
  
  // Action to set job result
  setJobResult: (view, result) => set((state) => ({
    jobResults: {
      ...state.jobResults,
      [view]: result
    }
  })),
  
  // Data selectors with memoization
  get userProfiles() {
    const result = get().jobResults.userProfiles;
    console.log('userProfiles selector', { result, status: result?.status });
    // Directly return mock data for now to ensure data is displayed
    if (result) {
      return result.result as User[];
    }
    return null;
  },
  
  get authStats() {
    const result = get().jobResults.authStats;
    console.log('authStats selector', { result, status: result?.status });
    // Directly return mock data for now to ensure data is displayed
    if (result) {
      return result.result as AuthStat[];
    }
    return null;
  },
  
  get storageUsage() {
    const result = get().jobResults.storageUsage;
    console.log('storageUsage selector', { result, status: result?.status });
    // Directly return mock data for now to ensure data is displayed
    if (result) {
      return result.result as StorageUsageData[];
    }
    return null;
  },
  
  // Action to fetch data for a view
  fetchData: async (view, useMockData = true) => {
    // Reset error state
    set({ error: null, isLoading: true });
    
    try {
      if (useMockData) {
        // Use mock data for demo purposes - synchronously to avoid timing issues
        console.log(`Loading mock data for ${view}`, mockJobResultsMap[view]);
        
        // Set result immediately to avoid state timing issues
        set((state) => {
          const newState = {
            jobResults: {
              ...state.jobResults,
              [view]: mockJobResultsMap[view]
            },
            isLoading: false
          };
          console.log('Setting new state', newState);
          return newState;
        });
        
        return;
      }
      
      // Get job ID for the selected view
      const jobId = get().jobIds[view];
      
      // Submit job with the predefined query for the selected view
      const query = PREDEFINED_QUERIES[view];
      await submitJob(jobId, query);
      
      // Poll for job result
      const result = await pollJobStatus(jobId);
      
      // Set job result
      set((state) => ({
        jobResults: {
          ...state.jobResults,
          [view]: result
        },
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  // Action to clear data for a view
  clearData: (view) => set((state) => ({
    jobResults: {
      ...state.jobResults,
      [view]: null
    }
  })),
  
  // Action to clear all data
  clearAllData: () => set({
    jobResults: {
      userProfiles: null,
      authStats: null,
      storageUsage: null,
      socialWeb: null,
      storageTribe: null
    }
  })
})); 