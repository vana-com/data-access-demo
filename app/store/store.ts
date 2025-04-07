import { create } from "zustand";
import { ViewType, User } from "../types";
import userData from "../../export/social-stats.json";

// Define the store's state and actions
interface AppState {
  currentView: ViewType;
  isLoading: boolean;
  error: string | null;
  userProfiles: User[] | null;

  setCurrentView: (view: ViewType) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  loadData: (view: ViewType) => void;
  clearData: (view: ViewType) => void;
  clearAllData: () => void;
}

// Create the Zustand store
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentView: "userProfiles",
  isLoading: false,
  error: null,
  userProfiles: null,

  // --- Simple Setters ---
  setCurrentView: (view) => set({ currentView: view, error: null }), // Clear error when view changes
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // --- Data Loading ---
  loadData: (view) => {
    set({ isLoading: true, error: null });

    try {
      const dataUpdate: Partial<AppState> = {};

      if (view === "userProfiles") {
        // Get users from the simplified JSON structure
        dataUpdate.userProfiles = userData as User[];
      } else {
        // Handle unknown view type
        console.warn("Attempted to load data for unknown view:", view);
      }

      set({ ...dataUpdate, isLoading: false });
    } catch (err) {
      console.error("Error loading data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      set({
        error: `Failed to load ${view}: ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // --- Data Clearing ---
  clearData: (view) => {
    if (view === "userProfiles") {
      set({ userProfiles: null });
    } else {
      // Handle unknown view type
      console.warn("Attempted to clear data for unknown view:", view);
    }
  },

  clearAllData: () =>
    set({
      userProfiles: null,
      error: null, // Also clear errors
    }),
}));
