// app/hooks/useGraphInteractions.ts
import { RefObject, useCallback, useState } from "react";
import { ForceGraphMethods, NodeObject } from "react-force-graph-2d";
import { GraphNode } from "../types/graph";

/**
 * Custom hook to manage user interactions with the force graph.
 * Handles node selection, hovering, filter changes, and camera control.
 *
 * @param graphRef - Ref object pointing to the ForceGraphMethods instance.
 * @returns An object containing interaction state and handler functions.
 */
export const useGraphInteractions = (
  graphRef: RefObject<ForceGraphMethods<NodeObject<GraphNode>>>
) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filteredLocale, setFilteredLocale] = useState<string | null>(null);
  const [filteredSource, setFilteredSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [connectionMode, setConnectionMode] = useState<string>("normal"); // Visualization mode

  // Handler for clicking on a node
  const handleNodeClick = useCallback(
    (node: GraphNode | null) => {
      const newSelectedNodeId =
        node && selectedNodeId === node.id ? null : node?.id || null;
      setSelectedNodeId(newSelectedNodeId);

      // Zoom and center logic
      if (newSelectedNodeId && node && graphRef.current) {
        // Check if x, y exist before centering
        if (typeof node.x === "number" && typeof node.y === "number") {
          graphRef.current.centerAt(node.x, node.y, 500); // Center animation
          graphRef.current.zoom(2.5, 500); // Zoom in animation
        } else {
          console.warn("Node clicked has no coordinates (x, y) for centering.");
          // Fallback zoom without centering if coordinates missing
          graphRef.current.zoom(2.5, 500);
        }
      } else if (!newSelectedNodeId && graphRef.current) {
        // If deselecting, zoom back out to fit
        graphRef.current.zoomToFit(500, 50); // Add padding
      }
    },
    [selectedNodeId, graphRef]
  ); // Dependency on selectedNodeId to toggle correctly

  // Handler for hovering over a node
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNodeId(node?.id || null);
    // Optional: Change cursor style globally (might need refinement)
    // document.body.style.cursor = node ? 'pointer' : 'default';
  }, []);

  // Handler for clicking the background (deselects node)
  const handleBackgroundClick = useCallback(() => {
    handleNodeClick(null); // Reuse node click logic for deselection and zoom out
  }, [handleNodeClick]);

  // Handler to clear all filters and selection
  const handleClearFilters = useCallback(() => {
    setFilteredLocale(null);
    setFilteredSource(null);
    setSearchQuery("");
    setSelectedNodeId(null); // Also clear selection
    setConnectionMode("normal"); // Reset connection mode
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50); // Reset zoom with padding
    }
  }, [graphRef]);

  return {
    selectedNodeId,
    setSelectedNodeId, // Expose setter if needed externally (though handleNodeClick is preferred)
    hoveredNodeId,
    setHoveredNodeId, // Expose setter if needed
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
  };
};
