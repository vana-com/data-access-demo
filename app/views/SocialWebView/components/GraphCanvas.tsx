"use client"; // This component uses refs and client-side libraries

import { Users } from "lucide-react";
import dynamic from "next/dynamic";
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ForceGraphMethods, NodeObject } from "react-force-graph-2d";
import { generateConnectionExplanation } from "../lib/graph-utils";
import {
  ForceGraphLinkObject,
  ForceGraphNodeObject,
  GraphLink,
  GraphNode,
} from "../types/graph";

// Local Skeleton for loading state within this component
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-muted rounded animate-pulse ${className}`} />
);

// Dynamically import ForceGraph2D to prevent SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
      <Users className="w-10 h-10 animate-pulse text-primary mb-4" />
      <p className="text-lg font-medium text-muted-foreground">
        Building social web...
      </p>
      <p className="text-sm text-muted-foreground">
        Please wait while we connect the dots.
      </p>
    </div>
  ),
});

interface GraphCanvasProps {
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  graphRef: RefObject<ForceGraphMethods<NodeObject<GraphNode>>>;
  nodePaint: (
    node: ForceGraphNodeObject,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => void;
  linkPaint: (
    link: ForceGraphLinkObject,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => void;
  onNodeClick: (node: GraphNode | null) => void;
  onNodeHover: (node: GraphNode | null) => void;
  onBackgroundClick: () => void;
  selectedNodeId: string | null;
  neighborLinkIds: Set<GraphLink>;
  users: { user_id: string; name: string }[]; // Needed for link labels
  isLoading?: boolean; // Optional loading state indicator
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  graphRef,
  nodePaint,
  linkPaint,
  onNodeClick,
  onNodeHover,
  onBackgroundClick,
  selectedNodeId,
  neighborLinkIds,
  users,
  isLoading = false, // Default to false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 }); // Initial small dimensions

  // Update dimensions when container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // Use offsetWidth/Height for actual rendered size, fallback to clientRect
        const width =
          containerRef.current.offsetWidth ||
          containerRef.current.getBoundingClientRect().width;
        const height =
          containerRef.current.offsetHeight ||
          containerRef.current.getBoundingClientRect().height;
        // Ensure minimum dimensions and prevent zero values during initial render
        setDimensions({
          width: Math.max(width, 50),
          height: Math.max(height, 50),
        });
        console.log("GraphCanvas dimensions updated:", { width, height });
      } else {
        console.log(
          "GraphCanvas containerRef not available for dimension update."
        );
      }
    };

    // Initial update after mount (using requestAnimationFrame ensures layout is calculated)
    const rafId = requestAnimationFrame(updateDimensions);

    // Use ResizeObserver for efficient resize detection
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions); // Debounce using rAF
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback for window resize (e.g., mobile orientation change)
    window.addEventListener("resize", updateDimensions);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
      console.log("GraphCanvas ResizeObserver disconnected.");
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Fit graph to view when data or dimensions change
  useEffect(() => {
    // Only attempt to fit if we have nodes and the graph is initialized
    if (graphData.nodes.length > 0 && graphRef.current) {
      // Use setTimeout to ensure the graph has initialized properly
      const timer = setTimeout(() => {
        if (graphRef.current) {
          // Zoom out to fit all nodes with some padding
          graphRef.current.zoomToFit(400, 60);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [graphData.nodes, dimensions, graphRef]);

  // Memoized link label generation
  const memoizedLinkLabel = useCallback(
    (link: object) => {
      // Cast link to our runtime type for hover labels
      const graphLink = link as GraphLink;
      // Check if source_type exists before generating explanation
      if (graphLink.source_type) {
        return generateConnectionExplanation(graphLink, users);
      }
      return ""; // Return empty string if source_type is missing
    },
    [users]
  ); // Dependency: users array

  // Memoized link directional particle color
  const memoizedLinkDirectionalParticleColor = useCallback(
    (link: object) => {
      const graphLink = link as GraphLink;
      // Show particle color only for neighbor links when a node is selected
      return selectedNodeId && neighborLinkIds.has(graphLink)
        ? graphLink.color
        : "transparent";
    },
    [selectedNodeId, neighborLinkIds]
  ); // Dependencies

  return (
    <div
      ref={containerRef}
      className="h-full w-full absolute inset-0 overflow-hidden"
    >
      {/* Show skeleton overlay if loading AND graph has some initial data (avoids flicker on first load) */}
      {isLoading && graphData.nodes.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <Skeleton className="w-16 h-16 rounded-full" />
          <p className="ml-4 text-muted-foreground">Updating graph...</p>
        </div>
      )}

      {/* Render ForceGraph only when dimensions are calculated and non-zero */}
      {dimensions.width > 50 && dimensions.height > 50 ? (
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          // Performance & Appearance
          nodeRelSize={1} // Use nodeCanvasObject for size control instead
          nodeCanvasObject={nodePaint}
          nodePointerAreaPaint={(node, color, ctx, globalScale) => {
            // Increase clickable area, especially when zoomed out
            ctx.fillStyle = color; // Use transparent color provided
            const baseRadius = 5; // Base radius used in nodePaint
            const clickRadius = Math.max(
              baseRadius / globalScale + 2,
              baseRadius
            ); // Ensure minimum click area
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, clickRadius, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          linkCanvasObjectMode={() => "after"} // Draw links after nodes for better visibility
          linkCanvasObject={linkPaint}
          linkDirectionalParticles={selectedNodeId ? 1 : 0} // Show particles only when node selected
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={memoizedLinkDirectionalParticleColor}
          linkLabel={memoizedLinkLabel} // Use memoized function
          backgroundColor="hsl(222.2 84% 4.9%)" // Dark background matching shadcn theme
          // Interaction
          onNodeClick={
            onNodeClick as (
              node: NodeObject<unknown>,
              event: MouseEvent
            ) => void
          } // Cast for compatibility
          onNodeHover={
            onNodeHover as (
              node: NodeObject<unknown> | null,
              previousNode: NodeObject<unknown> | null
            ) => void
          } // Cast for compatibility
          onBackgroundClick={onBackgroundClick}
          // Physics - Tuned for a slightly more active but stable layout
          cooldownTime={8000} // Longer cooldown for complex graphs
          d3AlphaDecay={0.02} // Slow decay for more settling time
          d3VelocityDecay={0.35} // Slightly higher friction
          warmupTicks={200} // More initial steps
          enableZoomInteraction={true}
          enablePanInteraction={true}
          enableNodeDrag={true}
        />
      ) : (
        // Show a placeholder or minimal loading state while dimensions are calculated
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          Calculating layout...
        </div>
      )}
    </div>
  );
};
