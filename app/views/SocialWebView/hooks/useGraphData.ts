import { useAppStore } from "@/app/store/store";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE_COLOR, LOCALE_COLORS } from "../lib/constants";
import { GraphLink, GraphNode } from "../types/graph";
import { AuthSource } from "@/app/types";

// Interface for locale statistics
interface LocaleStats {
  averageStorage: number;
  userCount: number;
  totalStorage: number;
}

/**
 * Custom hook to manage fetching, processing, and filtering data for the social graph.
 *
 * @param filteredLocale - The currently selected locale filter.
 * @param filteredSource - The currently selected auth source filter.
 * @param searchQuery - The current search query string.
 * @param selectedNodeId - The ID of the currently selected node (for highlighting neighbors).
 * @returns An object containing graph data, loading/error states, unique filters, and neighbor info.
 */
export const useGraphData = (
  filteredLocale: string | null,
  filteredSource: string | null,
  searchQuery: string,
  selectedNodeId: string | null
) => {
  const { userProfiles, authStats, storageUsage, fetchData, isLoading, error } =
    useAppStore();

  // Local state for auth sources (since we don't have it directly in the store)
  const [authSources, setAuthSources] = useState<AuthSource[]>([]);

  // State for the processed graph data
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });

  // State for neighbor highlighting
  const [neighborNodeIds, setNeighborNodeIds] = useState<Set<string>>(
    new Set()
  );
  const [neighborLinkIds, setNeighborLinkIds] = useState<Set<GraphLink>>(
    new Set()
  );

  // Store locale statistics for tooltips and visualization
  const [localeStats, setLocaleStats] = useState<Record<string, LocaleStats>>(
    {}
  );

  // Fetch data on mount if not already loaded
  useEffect(() => {
    if (!userProfiles && !isLoading) {
      console.log("useGraphData: Fetching userProfiles");
      fetchData("userProfiles");
    }
    if (!authStats && !isLoading) {
      console.log("useGraphData: Fetching authStats");
      fetchData("authStats");
    }
    if (!storageUsage && !isLoading) {
      console.log("useGraphData: Fetching storageUsage");
      fetchData("storageUsage");
    }
  }, [userProfiles, authStats, storageUsage, fetchData, isLoading]);

  // Fetch auth_sources data (this would come from the store in a real app)
  useEffect(() => {
    // In a real implementation, you would fetch this from an API or include in the store
    // We'll simulate it here based on authStats for now
    if (!authStats) return;

    // Generate synthetic auth source data based on stats
    // This is a workaround since we don't have real user-to-source mappings
    const synthAuthSources: AuthSource[] = [];

    // Only proceed if we have users and auth stats
    if (userProfiles && authStats) {
      // For each auth source type
      authStats.forEach((stat) => {
        // Calculate how many users should have this source
        const countForThisSource = stat.count;
        // For simplicity, we'll assign sources to users sequentially
        // In a real app, you'd get the actual user-source relationships from the API
        const usersWithThisSource = userProfiles.slice(0, countForThisSource);

        usersWithThisSource.forEach((user, index) => {
          synthAuthSources.push({
            auth_id: index + 1000 * (authStats.indexOf(stat) + 1), // Generate a unique ID
            user_id: user.user_id,
            source: stat.source,
            collection_date: new Date().toISOString(),
            data_type: "auth",
          });
        });
      });
    }

    setAuthSources(synthAuthSources);
  }, [userProfiles, authStats]);

  // Memoize base data processing (users, auth sources, storage)
  const users = useMemo(() => {
    // Use store data, no mock fallbacks
    return userProfiles || [];
  }, [userProfiles]);

  // Use auth sources from our local state
  const authSourcesData = useMemo(() => {
    return authSources;
  }, [authSources]);

  const storageMetricsData = useMemo(() => {
    const metrics = storageUsage || [];
    const userMap = new Map(users.map((u) => [u.user_id, u]));
    return metrics.map((metric) => ({
      user_id: metric.user_id,
      name: userMap.get(metric.user_id)?.name || "Unknown User",
      percent_used: metric.percent_used,
      recorded_at: metric.recorded_at,
    }));
  }, [storageUsage, users]);

  // Calculate statistics by locale (average storage usage, etc.)
  useEffect(() => {
    if (users.length === 0 || storageMetricsData.length === 0) return;

    // Create a map of user_id to storage percent
    const storageMap = new Map(
      storageMetricsData.map((s) => [s.user_id, s.percent_used])
    );

    // Group users by locale and calculate stats
    const localeStatsMap: Record<string, LocaleStats> = {};

    users.forEach((user) => {
      const locale = user.locale;
      const storagePercent = storageMap.get(user.user_id) || 0;

      // Initialize locale stats if not already done
      if (!localeStatsMap[locale]) {
        localeStatsMap[locale] = {
          userCount: 0,
          totalStorage: 0,
          averageStorage: 0,
        };
      }

      // Update statistics
      localeStatsMap[locale].userCount++;
      localeStatsMap[locale].totalStorage += storagePercent;
    });

    // Calculate averages
    for (const locale in localeStatsMap) {
      const stats = localeStatsMap[locale];
      stats.averageStorage = stats.totalStorage / stats.userCount;
    }

    setLocaleStats(localeStatsMap);
    console.log("Locale statistics calculated:", localeStatsMap);
  }, [users, storageMetricsData]);

  // Memoize unique filter options
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

  // Effect to build and filter graph data whenever DATA or FILTERS change
  // Important: This effect does NOT depend on selectedNodeId to avoid unnecessary rebuilds
  useEffect(() => {
    console.log("useGraphData: Rebuilding graph data...");

    if (users.length === 0 || authSourcesData.length === 0) {
      console.log("useGraphData: Insufficient data, setting empty graph.");
      setGraphData({ nodes: [], links: [] });
      setNeighborNodeIds(new Set());
      setNeighborLinkIds(new Set());
      return;
    }

    // --- 1. Create Base Nodes ---
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

    // Add locale statistics to node data
    const baseNodes: GraphNode[] = users.map((user) => {
      const userLocale = user.locale;
      const localeAvgStorage = localeStats[userLocale]?.averageStorage || 0;
      const localeUserCount = localeStats[userLocale]?.userCount || 0;

      return {
        id: user.user_id,
        name: user.name,
        locale: userLocale,
        storage: userStorageMap.get(user.user_id),
        color: LOCALE_COLORS[userLocale] || DEFAULT_LOCALE_COLOR,
        authSources: userAuthSourcesMap.get(user.user_id) || [],
        localeStats: {
          averageStorage: localeAvgStorage,
          userCount: localeUserCount,
        },
      };
    });

    // --- 2. Create Base Links ---
    // Modified to connect users by locale instead of auth source
    const usersByLocale: Record<string, string[]> = {};

    // Group users by locale
    users.forEach((user) => {
      const locale = user.locale;
      if (!usersByLocale[locale]) {
        usersByLocale[locale] = [];
      }
      usersByLocale[locale].push(user.user_id);
    });

    const baseLinks: GraphLink[] = [];
    const linkSet = new Set<string>(); // Avoid duplicates (A-B vs B-A for same locale)

    // Create links between users who share the same locale
    Object.entries(usersByLocale).forEach(([locale, userIds]) => {
      // Only create links if there are multiple users with this locale
      if (userIds.length > 1) {
        // Get the average storage for this locale
        const avgStorage = localeStats[locale]?.averageStorage || 0;
        const userCount = localeStats[locale]?.userCount || 0;

        for (let i = 0; i < userIds.length; i++) {
          for (let j = i + 1; j < userIds.length; j++) {
            const sourceId = userIds[i];
            const targetId = userIds[j];
            const linkId1 = `${sourceId}-${targetId}-${locale}`;
            const linkId2 = `${targetId}-${sourceId}-${locale}`;

            if (!linkSet.has(linkId1) && !linkSet.has(linkId2)) {
              baseLinks.push({
                source: sourceId,
                target: targetId,
                value: 1, // Simple connection value
                source_type: locale, // Use locale as source_type for consistency
                color: LOCALE_COLORS[locale] || DEFAULT_LOCALE_COLOR, // Use locale color
                // Add locale statistics to the link for tooltips
                localeStats: {
                  averageStorage: avgStorage.toFixed(1),
                  userCount,
                  locale,
                },
              });
              linkSet.add(linkId1);
            }
          }
        }
      }
    });

    // --- 3. Apply Filters ---
    let filteredNodes = [...baseNodes];
    let filteredLinks = [...baseLinks];
    const lowerQuery = searchQuery.toLowerCase().trim();

    // Locale Filter
    if (filteredLocale) {
      filteredNodes = filteredNodes.filter(
        (node) => node.locale === filteredLocale
      );
      // For locale connections, we need to filter links differently
      filteredLinks = filteredLinks.filter(
        (link) => link.source_type === filteredLocale
      );
    }

    // Source Filter - still useful for filtering by auth source
    if (filteredSource) {
      // Instead of filtering links, filter nodes with this auth source
      const nodesWithSource = new Set(
        authSourcesData
          .filter((auth) => auth.source === filteredSource)
          .map((auth) => auth.user_id)
      );

      filteredNodes = filteredNodes.filter(
        (node) =>
          nodesWithSource.has(node.id) ||
          (filteredLocale && node.locale === filteredLocale)
      );

      // Then filter links to only include filtered nodes
      const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
      filteredLinks = filteredLinks.filter(
        (link) =>
          filteredNodeIds.has(link.source as string) &&
          filteredNodeIds.has(link.target as string)
      );
    }

    // Search Query Filter (applied last)
    if (lowerQuery) {
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.id.toLowerCase().includes(lowerQuery) ||
          node.name.toLowerCase().includes(lowerQuery)
      );
    }

    // Mark filtered nodes and refine links
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
    filteredNodes = filteredNodes.map((node) => ({
      ...node,
      isFiltered: true,
    }));
    filteredLinks = filteredLinks.filter(
      (link) =>
        filteredNodeIds.has(link.source as string) &&
        filteredNodeIds.has(link.target as string)
    );

    // Update graph data
    setGraphData({ nodes: filteredNodes, links: filteredLinks });
  }, [
    users, // Base user data
    authSourcesData, // Base auth source data
    storageMetricsData, // Base storage data
    filteredLocale, // Filter criteria
    filteredSource, // Filter criteria
    searchQuery, // Filter criteria
    localeStats, // Added dependency for locale statistics
    // selectedNodeId removed from dependencies to avoid rebuilds when selecting nodes
  ]);

  // Separate effect to calculate neighbors when selectedNode changes
  // This avoids rebuilding the entire graph data when selection changes
  useEffect(() => {
    if (!selectedNodeId || graphData.nodes.length === 0) {
      // Reset neighbor sets if no node is selected
      setNeighborNodeIds(new Set());
      setNeighborLinkIds(new Set());
      return;
    }

    // Get the filtered node IDs from the current graph data
    const filteredNodeIds = new Set(graphData.nodes.map((node) => node.id));

    // Only proceed if the selected node exists in the filtered data
    if (!filteredNodeIds.has(selectedNodeId)) {
      setNeighborNodeIds(new Set());
      setNeighborLinkIds(new Set());
      return;
    }

    console.log("Calculating neighbors for selected node:", selectedNodeId);

    // Calculate neighbors for the selected node
    const newNeighborNodeIds = new Set<string>();
    const newNeighborLinkIds = new Set<GraphLink>();

    // Add selected node to its own neighbors
    newNeighborNodeIds.add(selectedNodeId);

    // Find all links connected to the selected node
    graphData.links.forEach((link) => {
      let neighborId: string | null = null;
      if (link.source === selectedNodeId) {
        neighborId = link.target as string;
      } else if (link.target === selectedNodeId) {
        neighborId = link.source as string;
      }

      if (neighborId && filteredNodeIds.has(neighborId)) {
        // Ensure neighbor is in filtered view
        newNeighborNodeIds.add(neighborId);
        newNeighborLinkIds.add(link);
      }
    });

    // Update neighbor sets
    setNeighborNodeIds(newNeighborNodeIds);
    setNeighborLinkIds(newNeighborLinkIds);
  }, [selectedNodeId, graphData]);

  return {
    graphData,
    isLoading: isLoading && (!userProfiles || !authStats || !storageUsage), // More accurate loading state
    error,
    uniqueLocales,
    uniqueSources,
    neighborNodeIds,
    neighborLinkIds,
    users, // Return users array for lookups elsewhere (e.g., legends)
    localeStats, // Export locale stats for use in other components
  };
};
