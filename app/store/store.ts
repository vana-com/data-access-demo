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
  
  // Data selectors - store as direct properties instead of getters
  userProfiles: User[] | null;
  authStats: AuthStat[] | null;
  storageUsage: StorageUsageData[] | null;
  
  // Actions
  fetchData: (view: ViewType, useMockData?: boolean) => Promise<void>;
  clearData: (view: ViewType) => void;
  clearAllData: () => void;
}

// Helper function to extract data from job results
const extractUserProfiles = (result: JobResultResponse | null): User[] | null => {
  if (!result) return null;
  return result.result as User[] || null;
};

const extractAuthStats = (result: JobResultResponse | null): AuthStat[] | null => {
  if (!result) return null;
  return result.result as AuthStat[] || null;
};

const extractStorageUsage = (result: JobResultResponse | null): StorageUsageData[] | null => {
  if (!result) return null;
  return result.result as StorageUsageData[] || null;
};

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
  
  // Initialize derived data as null
  userProfiles: null,
  authStats: null,
  storageUsage: null,
  
  // Action to set current view
  setCurrentView: (view) => set({ currentView: view }),
  
  // Action to set loading state
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Action to set error state
  setError: (error) => set({ error }),
  
  // Action to set job result
  setJobResult: (view, result) => set((state) => {
    const newJobResults = {
      ...state.jobResults,
      [view]: result
    };
    
    // Update derived data based on the view being updated
    const updates: Partial<AppState> = { jobResults: newJobResults };
    
    if (view === 'userProfiles') {
      updates.userProfiles = extractUserProfiles(result);
    } else if (view === 'authStats') {
      updates.authStats = extractAuthStats(result);
    } else if (view === 'storageUsage') {
      updates.storageUsage = extractStorageUsage(result);
    }
    
    return updates;
  }),
  
  // Action to fetch data for a view
  fetchData: async (view, useMockData = true) => {
    // Reset error state
    set({ error: null, isLoading: true });
    
    try {
      if (useMockData) {
        // Use mock data for demo purposes - synchronously to avoid timing issues
        console.log(`Loading mock data for ${view}`, mockJobResultsMap[view]);
        const mockResult = mockJobResultsMap[view];
        
        // Set result and update derived data immediately
        set((state) => {
          const newJobResults = {
            ...state.jobResults,
            [view]: mockResult
          };
          
          // Generate updates based on view type
          const updates: Partial<AppState> = { 
            jobResults: newJobResults,
            isLoading: false
          };
          
          // Update derived data
          if (view === 'userProfiles') {
            updates.userProfiles = extractUserProfiles(mockResult);
          } else if (view === 'authStats') {
            updates.authStats = extractAuthStats(mockResult);
          } else if (view === 'storageUsage') {
            updates.storageUsage = extractStorageUsage(mockResult);
          }
          
          console.log('Setting new state', updates);
          return updates;
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
      
      // Set job result and update derived data
      set((state) => {
        const newJobResults = {
          ...state.jobResults,
          [view]: result
        };
        
        // Generate updates based on view type
        const updates: Partial<AppState> = { 
          jobResults: newJobResults,
          isLoading: false
        };
        
        // Update derived data
        if (view === 'userProfiles') {
          updates.userProfiles = extractUserProfiles(result);
        } else if (view === 'authStats') {
          updates.authStats = extractAuthStats(result);
        } else if (view === 'storageUsage') {
          updates.storageUsage = extractStorageUsage(result);
        }
        
        return updates;
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      });
    }
  },
  
  // Action to clear data for a view
  clearData: (view) => set((state) => {
    const newJobResults = {
      ...state.jobResults,
      [view]: null
    };
    
    // Generate updates based on view type
    const updates: Partial<AppState> = { jobResults: newJobResults };
    
    // Update derived data
    if (view === 'userProfiles') {
      updates.userProfiles = null;
    } else if (view === 'authStats') {
      updates.authStats = null;
    } else if (view === 'storageUsage') {
      updates.storageUsage = null;
    }
    
    return updates;
  }),
  
  // Action to clear all data
  clearAllData: () => set({
    jobResults: {
      userProfiles: null,
      authStats: null,
      storageUsage: null,
      socialWeb: null,
      storageTribe: null
    },
    userProfiles: null,
    authStats: null,
    storageUsage: null
  })
})); 