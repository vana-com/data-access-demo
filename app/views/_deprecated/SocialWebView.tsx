"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import dynamic from "next/dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search, X, Globe, Link2, Users, RotateCcw, Wifi } from "lucide-react";
import { ForceGraphMethods, NodeObject } from "react-force-graph-2d";
import { useAppStore } from "../store/store";
import { mockAuthSources, mockUsers } from "../lib/mockData";

// Create local placeholder version of the Skeleton component
const Skeleton: React.FC<{ className?: string }> = (props) => (
  <div {...props} />
);

// Define node and link types for the graph
interface GraphNode {
  id: string;
  name: string;
  locale: string;
  storage?: number;
  color: string;
  isFiltered?: boolean;
  authSources: string[];
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  source_type: string;
  color: string;
}

// Define color palettes (using HSL for easier theme adaptation)
const LOCALE_COLORS: Record<string, string> = {
  "en-US": "hsl(221.2 83.2% 53.3%)",
  "en-GB": "hsl(217.2 91.2% 59.8%)",
  "en-AU": "hsl(210 40% 96.1%)",
  "en-CA": "hsl(210 40% 98%)",
  "es-ES": "hsl(0 84.2% 60.2%)",
  "ja-JP": "hsl(38.9 98.3% 50.8%)",
  "fr-FR": "hsl(322.5 80.5% 55.1%)",
  "zh-CN": "hsl(158.1 79.5% 47.1%)",
  "de-DE": "hsl(263.4 70% 50.4%)",
  "pt-BR": "hsl(243.8 89.6% 62.9%)",
};

const DEFAULT_LOCALE_COLOR = "hsl(210 40% 96.1%)";

const SOURCE_COLORS: Record<string, string> = {
  Google: "hsl(220 80% 60%)",
  Facebook: "hsl(221 44% 41%)",
  Twitter: "hsl(203 89% 53%)",
  Apple: "hsl(210 10% 60%)",
  GitHub: "hsl(210 10% 23%)",
};

const DEFAULT_SOURCE_COLOR = "hsl(210 20% 50%)";

// Add getAuthIcon function for displaying social icons
const getAuthIcon = (source: string): React.ReactElement => {
  const size = "h-4 w-4 inline mr-1";
  const svgBaseProps = {
    width: 16,
    height: 16,
    className: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
  };

  switch (source.toLowerCase()) {
    case "google":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Google</title>
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      );
    case "apple":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Apple</title>
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
      );
    case "microsoft":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Microsoft</title>
          <path d="M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>X</title>
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Facebook</title>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      );
    case "github":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>GitHub</title>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case "wechat":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>WeChat</title>
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.04-.857-2.578.325-4.836 2.771-6.416 1.838-1.187 4.136-1.548 6.221-1.133-.883-4.577-5.266-7.093-9.803-7.093zm-1.8 2.89a1.133 1.133 0 1 1 0 2.267 1.133 1.133 0 0 1 0-2.267zm5.092 0a1.133 1.133 0 1 1 0 2.267 1.133 1.133 0 0 1 0-2.267zm8.02 2.86c-4.354 0-7.877 3.063-7.877 6.803 0 3.742 3.523 6.803 7.877 6.803.307 0 .615-.02.915-.053 0 0 1.07.611 1.796.845a.33.33 0 0 0 .162.044.287.287 0 0 0 .288-.284c0-.066-.03-.129-.047-.195l-.382-1.45a.554.554 0 0 1 .196-.6c1.623-1.211 2.695-2.916 2.835-4.834.028-.379.038-.76.038-1.146 0-3.74-3.523-6.802-7.877-6.802zm-2.863 3.46a1.039 1.039 0 1 1 0 2.078 1.039 1.039 0 0 1 0-2.078zm5.754 0a1.039 1.039 0 1 1 0 2.078 1.039 1.039 0 0 1 0-2.078z" />
        </svg>
      );
    case "kakao":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Kakao</title>
          <path d="M22.125 0H1.875C.839 0 0 .84 0 1.875v20.25C0 23.161.84 24 1.875 24h20.25C23.161 24 24 23.16 24 22.125V1.875C24 .839 23.16 0 22.125 0zM12 18.75c-.591 0-1.17-.041-1.732-.12-.562.495-3.037 2.694-3.293 2.836.126-.591.93-3.503.967-3.635-2.774-1.287-4.45-3.683-4.45-6.081 0-4.494 3.808-8.25 8.508-8.25s8.508 3.756 8.508 8.25-3.808 8.25-8.508 8.25zm1.152-8.59h-2.304a.465.465 0 0 0-.464.468v2.883c0 .258.207.468.464.468a.466.466 0 0 0 .464-.468V14.1h1.84c.257 0 .464-.21.464-.469a.466.466 0 0 0-.464-.469zm-5.808-1.345h-1.611v1.59h1.61v-1.59zm0 2.278h-1.611v1.589h1.61v-1.59zm4.315-2.278H9.609v4.556c0 .258.21.468.468.468a.466.466 0 0 0 .464-.468v-1.055h1.118c.257 0 .464-.21.464-.469a.465.465 0 0 0-.464-.464H10.54v-1.478h1.118a.466.466 0 0 0 .465-.469.472.472 0 0 0-.465-.469zm5.133 0h-1.612v1.59h1.612v-1.59zm0 2.278h-1.612v1.589h1.612v-1.59z" />
        </svg>
      );
    default:
      return <Wifi className={size} />;
  }
};

interface ForceGraphNodeObject extends GraphNode {
  x?: number;
  y?: number;
}

interface ForceGraphLinkObject {
  source: ForceGraphNodeObject;
  target: ForceGraphNodeObject;
}

// Client-side only import for ForceGraph2D to avoid SSR issues
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

// Main Component
export const SocialWebView: React.FC = () => {
  const graphRef = useRef<ForceGraphMethods<NodeObject<GraphNode>>>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphDimensions, setGraphDimensions] = useState({
    width: 800,
    height: 600,
  });

  const { userProfiles, storageUsage, fetchData, isLoading, error } =
    useAppStore();

  useEffect(() => {
    if (!userProfiles && !isLoading) {
      console.log("SocialWebView: No user profiles data found, fetching");
      fetchData("userProfiles");
    }
    if (!storageUsage && !isLoading) {
      console.log("SocialWebView: No storage usage data found, fetching");
      fetchData("storageUsage");
    }
  }, [userProfiles, storageUsage, fetchData, isLoading]);

  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filteredLocale, setFilteredLocale] = useState<string | null>(null);
  const [filteredSource, setFilteredSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [neighborNodeIds, setNeighborNodeIds] = useState<Set<string>>(
    new Set()
  );
  const [neighborLinkIds, setNeighborLinkIds] = useState<Set<GraphLink>>(
    new Set()
  );
  const [connectionMode, setConnectionMode] = useState<string>("normal");

  // Use data from store only, similar to UserProfilesView
  const users = useMemo(() => {
    console.log("userProfiles value:", userProfiles);
    // If userProfiles is empty, use mockUsers as fallback for demo purposes
    if (!userProfiles || userProfiles.length === 0) {
      console.log("Using mockUsers as fallback");
      return mockUsers;
    }
    return userProfiles;
  }, [userProfiles]);

  // For this demo, we're using mockAuthSources directly
  // In a production environment, this would come from the store like userProfiles and storageUsage
  const authSourcesData = useMemo(() => {
    // The mockAuthSources has a different structure than what's used in the component
    // This maps it to the expected format with just user_id, source, collection_date
    return (
      mockAuthSources.map((auth) => ({
        user_id: auth.user_id,
        source: auth.source,
        collection_date: auth.collection_date,
      })) || []
    );
  }, []);

  const storageMetricsData = useMemo(() => {
    const metrics = storageUsage || [];
    const userMap = new Map(users.map((u) => [u.user_id, u]));

    return metrics.map((metric) => {
      const user = userMap.get(metric.user_id);
      return {
        user_id: metric.user_id,
        name: user?.name || "Unknown User",
        percent_used: metric.percent_used,
        recorded_at: metric.recorded_at,
      };
    });
  }, [storageUsage, users]);

  // Memoize unique locales and sources for filter dropdowns
  const uniqueLocales = useMemo(
    () =>
      Array.from(new Set(users.map((user) => user.locale))).sort() as string[],
    [users]
  );

  const uniqueSources = useMemo(
    () =>
      Array.from(
        new Set(authSourcesData.map((auth) => auth.source))
      ).sort() as string[],
    [authSourcesData]
  );

  // Build graph data (nodes and links) based on users, auth sources, and filters
  useEffect(() => {
    console.log("SocialWebView: Building graph data with", {
      users: users.length,
      authSourcesData: authSourcesData.length,
    });

    if (users.length === 0 || authSourcesData.length === 0) {
      console.log("SocialWebView: No data available, setting empty graph");
      setGraphData({ nodes: [], links: [] });
      return;
    }

    // 1. Create base nodes from users
    const userStorageMap = new Map(
      storageMetricsData.map((s) => [s.user_id, s.percent_used])
    );

    const userAuthSourcesMap = new Map<string, string[]>();

    authSourcesData.forEach((auth) => {
      if (!userAuthSourcesMap.has(auth.user_id)) {
        userAuthSourcesMap.set(auth.user_id, []);
      }

      userAuthSourcesMap.get(auth.user_id)?.push(auth.source);
    });

    const baseNodes: GraphNode[] = users.map((user) => ({
      id: user.user_id,
      name: user.name,
      locale: user.locale,
      storage: userStorageMap.get(user.user_id),
      color: LOCALE_COLORS[user.locale] || DEFAULT_LOCALE_COLOR,
      authSources: userAuthSourcesMap.get(user.user_id) || [],
    }));

    // 2. Build a map of users by source
    const usersBySource: Record<string, string[]> = {};

    authSourcesData.forEach((auth) => {
      if (!usersBySource[auth.source]) {
        usersBySource[auth.source] = [];
      }

      // Only include users present in the baseNodes (handles potential inconsistencies)
      if (baseNodes.some((n) => n.id === auth.user_id)) {
        usersBySource[auth.source].push(auth.user_id);
      }
    });

    // 3. Create base links between users with shared sources
    const baseLinks: GraphLink[] = [];

    const linkSet = new Set<string>(); // Avoid duplicate links (userA-userB vs userB-userA)

    Object.entries(usersBySource).forEach(([source, userIds]) => {
      for (let i = 0; i < userIds.length; i++) {
        for (let j = i + 1; j < userIds.length; j++) {
          const sourceId = userIds[i];
          const targetId = userIds[j];

          const linkId1 = `${sourceId}-${targetId}-${source}`;
          const linkId2 = `${targetId}-${sourceId}-${source}`;

          // Add link only if it doesn't exist already
          if (!linkSet.has(linkId1) && !linkSet.has(linkId2)) {
            baseLinks.push({
              source: sourceId,
              target: targetId,
              value: 1, // Simple connection value
              source_type: source,
              color: SOURCE_COLORS[source] || DEFAULT_SOURCE_COLOR,
            });

            linkSet.add(linkId1);
          }
        }
      }
    });

    // 4. Apply filters
    let filteredNodes = [...baseNodes];
    let filteredLinks = [...baseLinks];

    const lowerQuery = searchQuery.toLowerCase().trim();

    // Apply Locale Filter
    if (filteredLocale) {
      filteredNodes = filteredNodes.filter(
        (node) => node.locale === filteredLocale
      );
    }

    // Apply Source Filter
    if (filteredSource) {
      // Keep links of the specified source type
      filteredLinks = filteredLinks.filter(
        (link) => link.source_type === filteredSource
      );

      // Keep only nodes connected by these links
      const connectedNodeIds = new Set([
        ...filteredLinks.map((link) => link.source),
        ...filteredLinks.map((link) => link.target),
      ]);

      filteredNodes = filteredNodes.filter((node) =>
        connectedNodeIds.has(node.id)
      );
    }

    // Apply Search Query Filter (on top of other filters)
    if (lowerQuery) {
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.id.toLowerCase().includes(lowerQuery) ||
          node.name.toLowerCase().includes(lowerQuery)
      );
    }

    // Mark filtered nodes (useful for styling if needed)
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    filteredNodes = filteredNodes.map((node) => ({
      ...node,
      isFiltered: true,
    }));

    // Filter links to only include connections between the remaining filtered nodes
    filteredLinks = filteredLinks.filter(
      (link) =>
        filteredNodeIds.has(link.source as string) &&
        filteredNodeIds.has(link.target as string)
    );

    // 5. Handle Node Selection / Highlighting (applied to the *filtered* graph)
    const newNeighborNodeIds = new Set<string>();
    const newNeighborLinkIds = new Set<GraphLink>();

    if (selectedNodeId && filteredNodeIds.has(selectedNodeId)) {
      newNeighborNodeIds.add(selectedNodeId); // Add the selected node itself

      filteredLinks.forEach((link) => {
        if (link.source === selectedNodeId) {
          newNeighborNodeIds.add(link.target as string);
          newNeighborLinkIds.add(link);
        } else if (link.target === selectedNodeId) {
          newNeighborNodeIds.add(link.source as string);
          newNeighborLinkIds.add(link);
        }
      });
    }

    setNeighborNodeIds(newNeighborNodeIds);
    setNeighborLinkIds(newNeighborLinkIds);

    setGraphData({ nodes: filteredNodes, links: filteredLinks });
  }, [
    users,
    authSourcesData,
    storageMetricsData,
    filteredLocale,
    filteredSource,
    searchQuery,
    selectedNodeId, // Re-run when selection changes to update neighbors
  ]);

  // Update graph dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (graphContainerRef.current) {
        const { width, height } =
          graphContainerRef.current.getBoundingClientRect();

        setGraphDimensions({
          width: Math.max(width, 50), // Ensure minimum dimensions
          height: Math.max(height, 50),
        });
      }
    };

    // Initial update
    updateDimensions();

    // Ensure the graph is updated when the component is fully mounted
    requestAnimationFrame(updateDimensions);

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions);
    });

    if (graphContainerRef.current) {
      resizeObserver.observe(graphContainerRef.current);
    }

    // Also handle window resize
    window.addEventListener("resize", updateDimensions);

    // Clean up observer
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // --- Interaction Handlers ---
  const handleNodeClick = useCallback((node: GraphNode | null) => {
    // Toggle selection
    setSelectedNodeId((prevId) =>
      node && prevId === node.id ? null : node?.id || null
    );

    // Center on clicked node
    if (node && graphRef.current) {
      graphRef.current.centerAt(node.x!, node.y!, 500); // Center animation
      graphRef.current.zoom(2.5, 500); // Zoom in animation
    } else if (graphRef.current) {
      // If deselecting, zoom back out
      graphRef.current.zoomToFit(500, 50);
    }
  }, []);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNodeId(node?.id || null);

    // Optional: Change cursor style
    // document.body.style.cursor = node ? 'pointer' : 'default';
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilteredLocale(null);
    setFilteredSource(null);
    setSearchQuery("");
    setSelectedNodeId(null); // Also clear selection
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50); // Reset zoom
    }
  }, []);

  // --- Graph Rendering Customization ---
  const nodePaint = useCallback(
    (
      node: ForceGraphNodeObject,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const nodeId = node.id;

      const baseRadius = 5 / globalScale; // Base size, adjust as needed

      const isSelected = nodeId === selectedNodeId;

      const isNeighbor = neighborNodeIds.has(nodeId);

      const isHovered = nodeId === hoveredNodeId;

      let radius = baseRadius;

      let nodeColor = node.color || DEFAULT_LOCALE_COLOR;

      let borderColor = "rgba(255, 255, 255, 0.6)"; // Default border

      // Dim non-selected/non-neighbor nodes if a node is selected
      if (selectedNodeId && !isNeighbor) {
        nodeColor = "rgba(100, 100, 100, 0.3)"; // Dimmed color
        borderColor = "rgba(100, 100, 100, 0.1)";
      } else {
        nodeColor = node.color || DEFAULT_LOCALE_COLOR;
      }

      // Highlight selected node
      if (isSelected) {
        radius = baseRadius * 1.8;
        borderColor = "hsl(50, 100%, 50%)"; // Bright yellow border
      } else if (isNeighbor) {
        radius = baseRadius * 1.2;
        borderColor = "rgba(255, 255, 255, 0.8)"; // Slightly brighter border for neighbors
      }

      // Highlight hovered node
      if (isHovered && !isSelected) {
        radius = baseRadius * 1.5;
        borderColor = "rgba(255, 255, 255, 1)"; // Bright white border on hover
      }

      // Draw border (optional)
      if (node.x !== undefined && node.y !== undefined) {
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

        // Draw Label (only if zoomed in enough and node is relevant)
        const labelThreshold = 3; // Zoom level threshold to show labels
        if (
          globalScale > labelThreshold &&
          (isNeighbor || isSelected || !selectedNodeId)
        ) {
          const label = node.name;
          const fontSize = 3 / globalScale; // Adjust font size with zoom
          ctx.font = `${fontSize}px Inter`; // Use Inter font
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle =
            selectedNodeId && !isNeighbor
              ? "rgba(200, 200, 200, 0.5)"
              : "rgba(255, 255, 255, 0.85)"; // Text color
          ctx.fillText(label, node.x, node.y + radius + fontSize * 1.2); // Position below node
        }
      }
    },
    [selectedNodeId, hoveredNodeId, neighborNodeIds]
  );

  const linkPaint = useCallback(
    (
      link: ForceGraphLinkObject,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      // Safe access to source and target properties
      const source = typeof link.source === "object" ? link.source : null;
      const target = typeof link.target === "object" ? link.target : null;

      if (
        !source ||
        !target ||
        source.x === undefined ||
        source.y === undefined ||
        target.x === undefined ||
        target.y === undefined
      ) {
        return; // Skip if we don't have valid coordinates
      }

      // Try to determine if this is a neighbor link
      const sourceId = source.id;
      const targetId = target.id;

      const isNeighborLink =
        selectedNodeId &&
        neighborNodeIds.has(sourceId) &&
        neighborNodeIds.has(targetId);

      const baseWidth = 1 / globalScale;

      // Get color from the link's original data if available
      let linkColor =
        (link as unknown as { color?: string; source_type?: string }).color ||
        DEFAULT_SOURCE_COLOR;

      const sourceType =
        (link as unknown as { source_type?: string }).source_type || "";

      let lineWidth = baseWidth;

      // Dim non-neighbor links if a node is selected
      if (selectedNodeId && !isNeighborLink) {
        linkColor = "rgba(100, 100, 100, 0.1)"; // Very dim
        lineWidth = baseWidth * 0.5;
      } else if (selectedNodeId && isNeighborLink) {
        lineWidth = baseWidth * 1.5; // Make neighbor links thicker
      }

      // Apply connection visualization mode effects
      if (connectionMode === "source-colors" && sourceType) {
        // Enhance color based on source type to make it more distinctive
        linkColor = SOURCE_COLORS[sourceType] || DEFAULT_SOURCE_COLOR;

        if (isNeighborLink || !selectedNodeId) {
          lineWidth = baseWidth * 1.8; // Make source links more visible
        }
      } else if (connectionMode === "pulse") {
        // Create animated pulse effect
        const date = new Date();
        const time = date.getTime();
        const pulseSpeed = 2000; // 2 seconds per cycle
        const pulsePhase = (time % pulseSpeed) / pulseSpeed;

        // Only apply pulse to visible links
        if (isNeighborLink || !selectedNodeId) {
          lineWidth =
            baseWidth * (1 + Math.sin(pulsePhase * Math.PI * 2) * 0.5);
        }
      }

      // Draw the link
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = linkColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw source indicator for enhanced visualization
      if (
        (connectionMode === "source-types" ||
          connectionMode === "source-colors") &&
        (isNeighborLink || !selectedNodeId) &&
        sourceType
      ) {
        // Draw a small icon/marker in the middle of the link to indicate source type
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        ctx.beginPath();
        ctx.arc(midX, midY, baseWidth * 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = linkColor;
        ctx.fill();

        // Add text indicator for source type
        if (globalScale > 1.5) {
          const fontSize = 2 / globalScale;
          ctx.font = `${fontSize}px Inter`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "white";

          // Use first letter of source type as indicator
          ctx.fillText(sourceType.charAt(0), midX, midY);
        }
      }
    },
    [selectedNodeId, neighborNodeIds, connectionMode]
  );

  // Generate a human-readable explanation of the connection between two users
  const generateConnectionExplanation = useCallback(
    (link: GraphLink) => {
      const sourceUser = users.find((u) => u.user_id === link.source);
      const targetUser = users.find((u) => u.user_id === link.target);
      return `${sourceUser?.name || "User"} and ${
        targetUser?.name || "User"
      } are connected via ${link.source_type}`;
    },
    [users]
  );

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-text-muted">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-4 border border-destructive bg-destructive/10 rounded-md">
        <div className="flex gap-2 items-start">
          <div className="flex-shrink-0">
            <span className="text-destructive">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 4V8M8 12H8.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-destructive">
              Oops! Something went wrong.
            </h5>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
            <button
              onClick={() => {
                fetchData("userProfiles");
                fetchData("storageUsage");
              }}
              className="mt-4 text-sm px-3 py-1.5 bg-primary text-white rounded hover:bg-primary-hover transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Component ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/30 text-foreground overflow-hidden">
      {/* Header & Controls */}
      <header className="p-4 border-b bg-background/80 backdrop-blur-sm shadow-sm z-10">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <Users className="w-6 h-6 mr-2 text-primary" />
            Vana Social Web
          </h1>

          <div className="flex items-center flex-wrap gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-8 py-1 h-9 text-sm w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            {/* Connection Visualization Mode */}
            <Select
              value={connectionMode}
              onValueChange={(value) => setConnectionMode(value)}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <Link2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Connection Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal View</SelectItem>
                <SelectItem value="source-colors">Source Colors</SelectItem>
                <SelectItem value="source-types">Show Sources</SelectItem>
                <SelectItem value="pulse">Animated Pulse</SelectItem>
              </SelectContent>
            </Select>

            {/* Locale Filter */}
            <Select
              value={filteredLocale || "all"}
              onValueChange={(value) =>
                setFilteredLocale(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter Locale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locales</SelectItem>
                {uniqueLocales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {locale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select
              value={filteredSource || "all"}
              onValueChange={(value) =>
                setFilteredSource(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <Link2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(filteredLocale ||
              filteredSource ||
              searchQuery ||
              selectedNodeId) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-9"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear / Reset
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Graph + Legends) */}
      <main className="flex-1 container mx-auto py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Graph Area */}
        <Card className="lg:col-span-3 shadow-lg overflow-hidden relative h-[calc(100vh-200px)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Connections
            </CardTitle>
            <CardDescription>
              {selectedNodeId
                ? `Showing connections for ${
                    users.find((u) => u.user_id === selectedNodeId)?.name ||
                    selectedNodeId
                  }`
                : filteredLocale || filteredSource || searchQuery
                ? "Filtered view"
                : "Explore connections based on shared login sources."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-70px)] relative">
            {isLoading && users.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                <Skeleton className="w-16 h-16 rounded-full animate-pulse" />
              </div>
            )}
            {graphData.nodes.length > 0 ? (
              <div
                className="h-full w-full absolute inset-0"
                ref={graphContainerRef}
              >
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  width={graphDimensions.width}
                  height={graphDimensions.height}
                  // Performance & Appearance
                  nodeRelSize={1} // Use nodeCanvasObject for size control
                  nodeCanvasObject={nodePaint}
                  nodePointerAreaPaint={(node, color, ctx) => {
                    // Increase clickable area
                    ctx.fillStyle = color;
                    const r = 5 / (graphRef.current?.zoom?.() || 1) + 2; // Safely access zoom with fallback
                    ctx.beginPath();
                    ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI, false);
                    ctx.fill();
                  }}
                  linkCanvasObjectMode={() => "after"} // Draw links after nodes
                  linkCanvasObject={linkPaint}
                  linkDirectionalParticles={selectedNodeId ? 1 : 0} // Show particles only when node selected
                  linkDirectionalParticleWidth={1.5}
                  linkDirectionalParticleColor={(link) =>
                    neighborLinkIds.has(link as GraphLink)
                      ? (link as GraphLink).color
                      : "transparent"
                  }
                  linkLabel={(link) =>
                    generateConnectionExplanation(link as GraphLink)
                  }
                  backgroundColor="hsl(222.2 84% 4.9%)" // Dark background matching shadcn theme
                  // Interaction
                  onNodeClick={handleNodeClick}
                  onNodeHover={handleNodeHover}
                  onBackgroundClick={() => handleNodeClick(null)} // Click background to deselect
                  // Physics - Adjust for desired "feel"
                  cooldownTime={6000} // Time before stopping simulation
                  d3AlphaDecay={0.02} // How quickly simulation cools down (lower = longer)
                  d3VelocityDecay={0.3} // How quickly nodes slow down (higher = faster stop)
                  warmupTicks={150} // Initial simulation steps
                  enableZoomInteraction={true}
                  enablePanInteraction={true}
                  enableNodeDrag={true}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <Globe className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No connections found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting the filters or clearing the search query.
                  </p>
                  {(filteredLocale || filteredSource || searchQuery) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="mt-4"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Add a connection explanation card */}
            {selectedNodeId && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-card/90 backdrop-blur-sm border rounded-md shadow-md text-sm max-w-lg mx-auto">
                <h3 className="text-base font-medium mb-1 flex items-center">
                  <Link2 className="w-4 h-4 mr-2 text-primary" />
                  Connection Information
                </h3>
                <p className="text-muted-foreground">
                  {`${
                    users.find((u) => u.user_id === selectedNodeId)?.name ||
                    "This user"
                  } is connected to others through shared login sources.`}
                </p>
                <p className="text-xs mt-2 text-muted-foreground/80">
                  <strong>Tip:</strong> Hover over connections to see exactly
                  which services are shared.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legends Area */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto h-[calc(100vh-200px)] pb-6 pr-2">
          {/* Node Info / Selected Node Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Node Information</CardTitle>
              <CardDescription>
                {selectedNodeId
                  ? "Details for selected user"
                  : "Hover over or select a node"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {selectedNodeId ? (
                (() => {
                  const node = graphData.nodes.find(
                    (n) => n.id === selectedNodeId
                  );

                  if (!node)
                    return (
                      <p className="text-muted-foreground">
                        Node not found in current view.
                      </p>
                    );

                  return (
                    <>
                      <p>
                        <strong>ID:</strong> {node.id}
                      </p>
                      <p>
                        <strong>Name:</strong> {node.name}
                      </p>
                      <p>
                        <strong>Locale:</strong>
                        <span className="inline-flex items-center">
                          <span
                            className="w-3 h-3 rounded-full mr-1.5"
                            style={{ backgroundColor: node.color }}
                          ></span>
                          {node.locale}
                        </span>
                      </p>
                      <p>
                        <strong>Storage Used:</strong>
                        {node.storage !== undefined
                          ? `${node.storage.toFixed(1)}%`
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Auth Sources:</strong>
                      </p>
                      <ul className="list-disc list-inside pl-2">
                        {node.authSources.length > 0 ? (
                          node.authSources.map((src) => (
                            <li key={src} className="flex items-center">
                              {getAuthIcon(src)}
                              {src}
                            </li>
                          ))
                        ) : (
                          <li>None</li>
                        )}
                      </ul>
                      <p className="mt-2">
                        <strong>Connections:</strong>
                        {neighborNodeIds.size - 1}
                      </p>
                      {/* Exclude self */}
                    </>
                  );
                })()
              ) : (
                <p className="text-muted-foreground italic">
                  {hoveredNodeId
                    ? `Hovering: ${
                        graphData.nodes.find((n) => n.id === hoveredNodeId)
                          ?.name || hoveredNodeId
                      }`
                    : "No node selected."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Locale Legend Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Globe className="w-4 h-4 mr-2" /> Locale Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {Object.entries(LOCALE_COLORS).map(([locale, color]) => (
                <div
                  key={locale}
                  className="flex items-center space-x-2 truncate"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span
                    className="text-muted-foreground truncate"
                    title={locale}
                  >
                    {locale}
                  </span>
                </div>
              ))}
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: DEFAULT_LOCALE_COLOR }}
                ></span>
                <span className="text-muted-foreground truncate" title="Other">
                  Other
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Source Legend Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Link2 className="w-4 h-4 mr-2" /> Auth Source Legend
              </CardTitle>
              <CardDescription className="text-xs">
                Link colors indicate shared source
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {Object.entries(SOURCE_COLORS).map(([source, color]) => (
                <div
                  key={source}
                  className="flex items-center space-x-2 truncate"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span
                    className="text-muted-foreground truncate flex items-center"
                    title={source}
                  >
                    {getAuthIcon(source)}
                    {source}
                  </span>
                </div>
              ))}
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: DEFAULT_SOURCE_COLOR }}
                ></span>
                <span className="text-muted-foreground truncate" title="Other">
                  Other
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
