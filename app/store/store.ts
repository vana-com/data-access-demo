import { create } from "zustand";
import { ViewType, User } from "./types";

// Define the store's state and actions
interface AppState {
  currentView: ViewType;
  isLoading: boolean;
  error: string | null;
  userProfiles: User[] | null;

  setCurrentView: (view: ViewType) => void;
  loadData: () => Promise<void>;
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

  // --- Data Loading ---
  loadData: async () => {
    set({ isLoading: true, error: null });

    try {
      const dataUpdate: Partial<AppState> = {};

      // Fetch data from our API endpoint that handles Vercel Blob retrieval
      const response = await fetch("/api/social-stats");
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const userData = await response.json();
      dataUpdate.userProfiles = userData as User[];

      set({ ...dataUpdate, isLoading: false });
    } catch (err) {
      console.error("Error loading data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      set({
        error: `Failed to load data: ${errorMessage}`,
        isLoading: false,
      });
    }
  },
}));
