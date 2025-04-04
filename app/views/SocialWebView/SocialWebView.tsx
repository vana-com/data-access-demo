"use client"; // Required for hooks and client-side interactions

import React, { useRef, useEffect } from "react";
import { ForceGraphMethods, NodeObject } from "react-force-graph-2d";
import { RotateCcw, Globe, Link2 } from "lucide-react";

// Import UI Components (assuming they are correctly set up)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import Refactored Components and Hooks
import { useGraphData } from "./hooks/useGraphData";
import { useGraphInteractions } from "./hooks/useGraphInteractions";
import { useGraphRendering } from "./hooks/useGraphRendering";
import { GraphCanvas } from "./components/GraphCanvas";
import { SocialWebHeader } from "./components/SocialWebHeader";
import { GraphLegends } from "./components/GraphLegends";
import { GraphNode } from "./types/graph"; // Import base type if needed
import { useAppStore } from "@/app/store/store";

// Main Refactored Component
export const SocialWebView: React.FC = () => {
  // Get store data and fetch function
  const {
    fetchData,
    userProfiles,
    authStats,
    storageUsage,
    isLoading: storeLoading,
  } = useAppStore();

  // Fetch data when the component mounts if not already loaded
  useEffect(() => {
    // Create a simple function to safely fetch data based on current state
    const loadInitialData = async () => {
      try {
        // Load profiles first if needed
        if (!userProfiles) {
          console.log("Loading user profiles...");
          await fetchData("userProfiles");
        }

        // Using a separate condition to avoid dependency issues
        if (!authStats) {
          console.log("Loading auth stats...");
          await fetchData("authStats");
        }

        // Load storage data if needed
        if (!storageUsage) {
          console.log("Loading storage usage...");
          await fetchData("storageUsage");
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    // Only trigger loading if we're not already loading and need data
    if (!storeLoading && (!userProfiles || !authStats || !storageUsage)) {
      loadInitialData();
    }
  }, [fetchData, userProfiles, authStats, storageUsage, storeLoading]);

  // Ref for accessing ForceGraph methods (e.g., zoom, center)
  const graphRef = useRef<ForceGraphMethods<NodeObject<GraphNode>>>(null);

  // --- Hooks ---
  // Hook for managing interactions (selection, hover, filters, zoom/pan)
  const {
    selectedNodeId,
    hoveredNodeId,
    filteredLocale,
    setFilteredLocale,
    filteredSource,
    setFilteredSource,
    searchQuery,
    setSearchQuery,
    connectionMode,
    setConnectionMode,
    handleNodeClick,
    handleNodeHover,
    handleBackgroundClick,
    handleClearFilters,
  } = useGraphInteractions(graphRef); // Pass graphRef to the interactions hook

  // Hook for fetching, processing, and filtering graph data
  // It depends on filters and selection from the interactions hook
  const {
    graphData,
    isLoading: graphLoading,
    error,
    uniqueLocales,
    uniqueSources,
    neighborNodeIds,
    neighborLinkIds,
    users, // Get users array for link labels and legends
    localeStats, // Get locale statistics
  } = useGraphData(filteredLocale, filteredSource, searchQuery, selectedNodeId);

  // Hook for providing node and link painting functions
  // Depends on interaction state (selection, hover) and data state (neighbors)
  const { nodePaint, linkPaint } = useGraphRendering(
    selectedNodeId,
    hoveredNodeId,
    neighborNodeIds,
    neighborLinkIds,
    connectionMode
  );

  // Force graph rebuild when data changes - removed direct graphData method call
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      console.log("Rebuilding graph visualization...");
      // The graph will automatically update when graphData prop changes
      // No need to call graphRef.current.graphData() directly

      // Adjust camera to fit content after data updates
      setTimeout(() => {
        graphRef.current?.zoomToFit(400);
      }, 300);
    }
  }, [graphData]);

  // --- Loading and Error States ---
  if ((storeLoading || graphLoading) && graphData.nodes.length === 0) {
    // Show full page loader only on initial load
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading social web data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background p-4">
        <div className="max-w-lg mx-auto p-6 border border-destructive bg-destructive/10 rounded-lg shadow-md">
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 mt-1">
              <span className="text-destructive">
                {/* Simple Error Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 4V8M8 12H8.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-destructive text-lg">
                Oops! Something went wrong.
              </h5>
              <p className="text-sm text-destructive/80 mt-1 mb-4">
                We couldn&apos;t load the social web data. Please check your
                connection or try again.
              </p>
              {/* Display error details */}
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded border">
                Error:{" "}
                {typeof error === "string" ? error : JSON.stringify(error)}
              </p>
              {/* Retry Button - Implement retry logic with store */}
              <Button
                onClick={() => {
                  fetchData("userProfiles");
                  fetchData("authStats");
                  fetchData("storageUsage");
                }}
                variant="destructive"
                size="sm"
                className="mt-4 inline-flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Component ---
  return (
    // Main layout container
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/30 text-foreground overflow-hidden">
      {/* Header Component */}
      <SocialWebHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        connectionMode={connectionMode}
        onConnectionModeChange={setConnectionMode}
        filteredLocale={filteredLocale}
        onFilteredLocaleChange={setFilteredLocale}
        uniqueLocales={uniqueLocales}
        filteredSource={filteredSource}
        onFilteredSourceChange={setFilteredSource}
        uniqueSources={uniqueSources}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Graph Area Wrapper */}
        <Card className="lg:col-span-3 shadow-lg overflow-hidden relative h-[calc(100vh-160px)] pb-0">
          {/* Adjusted height calculation */}
          <CardHeader className="pb-2 pt-4 px-4">
            {/* Dynamic Title based on selection/filter */}
            <CardTitle className="text-lg font-semibold flex items-center">
              {/* Icon can change based on state */}
              {selectedNodeId ? (
                <Link2 className="w-5 h-5 mr-2 text-primary" />
              ) : (
                <Globe className="w-5 h-5 mr-2 text-primary" />
              )}
              User Connections
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedNodeId
                ? `Showing connections for ${
                    users.find((u) => u.user_id === selectedNodeId)?.name ||
                    selectedNodeId
                  }`
                : filteredLocale || filteredSource || searchQuery
                ? "Filtered network view"
                : "Explore connections based on shared login sources."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-64px)] relative">
            {/* Adjusted height */}
            {/* Render Graph or No Results Message */}
            {graphData.nodes.length > 0 ? (
              <GraphCanvas
                graphData={graphData}
                graphRef={graphRef}
                nodePaint={nodePaint}
                linkPaint={linkPaint}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                onBackgroundClick={handleBackgroundClick}
                selectedNodeId={selectedNodeId}
                neighborLinkIds={neighborLinkIds}
                users={users} // Pass users for link labels
                isLoading={storeLoading || graphLoading} // Pass combined loading state for overlay
              />
            ) : (
              // No Results View
              <div className="flex items-center justify-center h-full text-center p-8 flex-col">
                <Globe className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No connections found
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  No users match the current filter criteria. Try adjusting
                  filters or clearing the search.
                </p>
                {(filteredLocale || filteredSource || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-6"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear Filters & Reset View
                  </Button>
                )}
              </div>
            )}
            {/* Connection Info Overlay (Optional) */}
            {selectedNodeId && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-card/90 backdrop-blur-sm border rounded-md shadow-md text-sm max-w-md mx-auto pointer-events-none">
                <h3 className="text-base font-medium mb-1 flex items-center">
                  <Link2 className="w-4 h-4 mr-2 text-primary" />
                  Connection Information
                </h3>
                <p className="text-muted-foreground text-xs">
                  {`${
                    users.find((u) => u.user_id === selectedNodeId)?.name ||
                    "This user"
                  } is connected to others via shared login sources.`}
                  Hover over links for details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legends Area Wrapper */}
        <div className="lg:col-span-1 overflow-hidden h-[calc(100vh-160px)]">
          {/* Match height */}
          <GraphLegends
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            graphData={graphData}
            localeStats={localeStats}
          />
        </div>
      </main>
    </div>
  );
};

// Export the main component
export default SocialWebView;
