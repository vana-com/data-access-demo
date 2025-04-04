import { useCallback } from "react";
import {
  ForceGraphNodeObject,
  ForceGraphLinkObject,
  GraphLink,
} from "../types/graph";
import {
  DEFAULT_LOCALE_COLOR,
  SOURCE_COLORS,
  DEFAULT_SOURCE_COLOR,
} from "../lib/constants";

/**
 * Custom hook providing memoized canvas painting functions for nodes and links.
 *
 * @param selectedNodeId - ID of the selected node for highlighting.
 * @param hoveredNodeId - ID of the hovered node for highlighting.
 * @param neighborNodeIds - Set of IDs of nodes connected to the selected node.
 * @param neighborLinkIds - Set of link objects connected to the selected node.
 * @param connectionMode - Current visualization mode ('normal', 'source-colors', etc.).
 * @returns An object containing nodePaint and linkPaint functions.
 */
export const useGraphRendering = (
  selectedNodeId: string | null,
  hoveredNodeId: string | null,
  neighborNodeIds: Set<string>,
  neighborLinkIds: Set<GraphLink>, // Use the original GraphLink type
  connectionMode: string
) => {
  // --- Node Painting Logic ---
  const nodePaint = useCallback(
    (
      node: ForceGraphNodeObject, // Use the specific type
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      // Ensure node and its coordinates are valid
      if (node.x === undefined || node.y === undefined) {
        console.warn(
          "Skipping node paint for node without coordinates:",
          node.id
        );
        return;
      }

      const nodeId = node.id;
      const baseRadius = 5 / globalScale; // Base size, scales with zoom

      const isSelected = nodeId === selectedNodeId;
      const isNeighbor = neighborNodeIds.has(nodeId);
      const isHovered = nodeId === hoveredNodeId;

      // Get the locale average storage usage for scaling
      const localeAvgStorage = node.localeStats?.averageStorage || 0;

      // Scale factor based on average storage - minimum 1.0, maximum 3.0
      // This means nodes with higher storage will be up to 3x larger
      const storageScaleFactor = 1 + Math.min(2, localeAvgStorage / 50); // Divide by 50 to normalize (assuming 100% is max)

      let radius = baseRadius * storageScaleFactor; // Apply storage-based scaling
      let nodeColor = node.color || DEFAULT_LOCALE_COLOR;
      let borderColor = "rgba(255, 255, 255, 0.6)"; // Default border

      // --- Determine Style based on State ---

      // Dim non-relevant nodes if a node is selected
      if (selectedNodeId && !isNeighbor) {
        nodeColor = "rgba(100, 100, 100, 0.3)"; // Dimmed color
        borderColor = "rgba(100, 100, 100, 0.1)";
      } else {
        nodeColor = node.color || DEFAULT_LOCALE_COLOR; // Use node's assigned color
      }

      // Highlight selected node
      if (isSelected) {
        radius *= 1.5; // Additional size increase for selected
        borderColor = "hsl(50, 100%, 50%)"; // Bright yellow border
      }
      // Highlight neighbors (if not the selected node itself)
      else if (isNeighbor) {
        radius *= 1.2; // Additional size increase for neighbors
        borderColor = "rgba(255, 255, 255, 0.8)"; // Slightly brighter border
      }

      // Highlight hovered node (overrides neighbor/default, but not selected)
      if (isHovered && !isSelected) {
        radius *= 1.3; // Additional size increase for hover
        borderColor = "rgba(255, 255, 255, 1)"; // Bright white border
      }

      // --- Draw Storage Usage Indicator Ring ---
      // Draw an outer ring that shows the actual storage usage of this node (not the average)
      if (node.storage !== undefined && node.storage > 0) {
        const storagePercent = node.storage / 100; // Convert to 0-1 range
        const storageAngle = storagePercent * 2 * Math.PI;

        // Draw storage indicator arc
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          radius + 1.2 / globalScale,
          -Math.PI / 2, // Start at top
          -Math.PI / 2 + storageAngle, // End based on storage percentage
          false
        );

        // Use a gradient color based on storage percentage
        let storageColor;
        if (storagePercent < 0.5) {
          storageColor = "rgba(0, 255, 0, 0.7)"; // Green for low usage
        } else if (storagePercent < 0.75) {
          storageColor = "rgba(255, 255, 0, 0.7)"; // Yellow for medium usage
        } else {
          storageColor = "rgba(255, 50, 50, 0.7)"; // Red for high usage
        }

        ctx.strokeStyle = storageColor;
        ctx.lineWidth = 1.2 / globalScale;
        ctx.stroke();
      }

      // --- Draw Node ---

      // Draw border (slightly larger circle behind the main node)
      ctx.beginPath();
      ctx.arc(
        node.x,
        node.y,
        radius + 0.5 / globalScale,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = borderColor;
      ctx.fill();

      // Draw main node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = nodeColor;
      ctx.fill();

      // --- Draw Label ---
      const labelThreshold = 3; // Zoom level threshold to show labels
      const showLabel =
        globalScale > labelThreshold &&
        (isNeighbor || isSelected || !selectedNodeId);

      if (showLabel) {
        const label = node.name || node.id; // Fallback to ID if name is missing
        const fontSize = Math.max(1, 3 / globalScale); // Ensure minimum font size
        ctx.font = `bold ${fontSize}px Inter, sans-serif`; // Use Inter font, fallback sans-serif
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Determine text color based on selection state
        const textColor =
          selectedNodeId && !isNeighbor
            ? "rgba(200, 200, 200, 0.5)" // Dimmed text for non-neighbors
            : "rgba(255, 255, 255, 0.85)"; // Brighter text otherwise

        ctx.fillStyle = textColor;
        // Position label slightly below the node
        ctx.fillText(label, node.x, node.y + radius + fontSize * 1.2);

        // Draw locale stats for the first node of each locale cluster
        // To avoid cluttering, we'll only draw this for selected nodes or when zoomed in sufficiently
        if (
          (isSelected || globalScale > 5) &&
          node.localeStats &&
          node.localeStats.userCount > 0
        ) {
          const statsY = node.y + radius + fontSize * 2.8;
          const smallerFontSize = fontSize * 0.85;

          ctx.font = `${smallerFontSize}px Inter, sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

          // Format the storage percentage to one decimal place
          const avgStorage = node.localeStats.averageStorage.toFixed
            ? node.localeStats.averageStorage.toFixed(1)
            : node.localeStats.averageStorage;

          // Show the locale name and storage usage
          ctx.fillText(
            `${node.locale} • Storage: ${avgStorage}%`,
            node.x,
            statsY
          );

          // Show user count on next line
          ctx.fillText(
            `${node.localeStats.userCount} users`,
            node.x,
            statsY + smallerFontSize * 1.2
          );
        }
      }

      // Always show a small indicator of storage percentage near the node
      if (localeAvgStorage > 0 && !showLabel) {
        const tinyFontSize = Math.max(0.8, 2 / globalScale);
        ctx.font = `${tinyFontSize}px Inter, sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Display a compact storage indicator when not showing full labels
        ctx.fillText(
          `${Math.round(localeAvgStorage)}%`,
          node.x,
          node.y + radius + tinyFontSize
        );
      }
    },
    [selectedNodeId, hoveredNodeId, neighborNodeIds] // Dependencies for recalculation
  );

  // --- Link Painting Logic ---
  const linkPaint = useCallback(
    (
      link: ForceGraphLinkObject, // Use the specific type
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      // Type guards to ensure source and target are resolved node objects with coordinates
      if (
        typeof link.source !== "object" ||
        link.source === null ||
        typeof link.target !== "object" ||
        link.target === null ||
        typeof link.source.x !== "number" ||
        typeof link.source.y !== "number" ||
        typeof link.target.x !== "number" ||
        typeof link.target.y !== "number"
      ) {
        // console.warn("Skipping link paint due to unresolved or invalid source/target:", link);
        return; // Skip if source/target aren't resolved objects with coords
      }

      // Now we know source and target are ForceGraphNodeObject
      const source = link.source as ForceGraphNodeObject;
      const target = link.target as ForceGraphNodeObject;

      // Cast the link back to our GraphLink type to access custom props easily
      const graphLink = link as unknown as GraphLink;

      // Determine if this link connects two neighbors of the selected node
      const isNeighborLink = selectedNodeId
        ? neighborLinkIds.has(graphLink) // Check if the link itself is in the neighbor set
        : false; // No neighbor links if nothing is selected

      const baseWidth = 1 / globalScale; // Base line width, scales with zoom
      let linkColor = graphLink.color || DEFAULT_SOURCE_COLOR; // Use color from our data
      const sourceType = graphLink.source_type || "";
      let lineWidth = baseWidth;

      // --- Determine Style based on State and Mode ---

      // Dim non-neighbor links if a node is selected
      if (selectedNodeId && !isNeighborLink) {
        linkColor = "rgba(100, 100, 100, 0.1)"; // Very dim
        lineWidth = baseWidth * 0.5;
      } else if (selectedNodeId && isNeighborLink) {
        lineWidth = baseWidth * 1.5; // Make neighbor links thicker
      }

      // Apply connection visualization mode effects (only to visible links)
      const isVisibleLink = !selectedNodeId || isNeighborLink;
      if (isVisibleLink) {
        if (connectionMode === "source-colors" && sourceType) {
          linkColor = SOURCE_COLORS[sourceType] || DEFAULT_SOURCE_COLOR;
          lineWidth = baseWidth * 1.8; // Make source-colored links more prominent
        } else if (connectionMode === "pulse") {
          const time = Date.now();
          const pulseSpeed = 2000; // ms per cycle
          const pulsePhase = (time % pulseSpeed) / pulseSpeed; // 0 to 1
          // Use Math.abs(Math.sin(...)) for a pulse effect (1 -> 1.5 -> 1)
          lineWidth =
            baseWidth * (1 + Math.abs(Math.sin(pulsePhase * Math.PI)) * 0.5);
        }
      }

      // --- Draw the Link Line ---
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = linkColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // --- Draw Source Indicator (Optional based on mode) ---
      const showSourceIndicator =
        (connectionMode === "source-types" ||
          connectionMode === "source-colors") &&
        isVisibleLink &&
        sourceType;

      if (showSourceIndicator) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const indicatorRadius = Math.max(1, baseWidth * 2); // Small circle indicator

        // Draw colored circle indicator
        ctx.beginPath();
        ctx.arc(midX, midY, indicatorRadius, 0, 2 * Math.PI, false);
        // Use the potentially modified linkColor (e.g., from source-colors mode)
        ctx.fillStyle = linkColor;
        ctx.fill();

        // Add text indicator (e.g., first letter) if zoomed in enough
        const sourceLabelThreshold = 1.5;
        if (globalScale > sourceLabelThreshold) {
          const fontSize = Math.max(1, 2 / globalScale);
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Use a contrasting color for the text (e.g., white)
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          // Use first letter of source type as indicator
          ctx.fillText(sourceType.charAt(0).toUpperCase(), midX, midY + 0.5); // Slight offset for better centering
        }
      }
    },
    [selectedNodeId, neighborNodeIds, neighborLinkIds, connectionMode] // Dependencies
  );

  return { nodePaint, linkPaint };
};
