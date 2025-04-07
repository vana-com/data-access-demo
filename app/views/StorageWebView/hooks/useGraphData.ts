import { useAppStore } from "@/app/store/store";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE_COLOR, LOCALE_COLORS } from "../lib/constants";
import { GraphLink, GraphNode } from "../types/graph";

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
  const { userProfiles, loadData, isLoading, error } = useAppStore();

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
      loadData("userProfiles");
    }
  }, [userProfiles, loadData, isLoading]);

  // Memoize base data processing
  const users = useMemo(() => {
    // Use store data, no mock fallbacks
    return userProfiles || [];
  }, [userProfiles]);

  // Memoize unique auth sources directly from users
  const uniqueAuthSources = useMemo(() => {
    if (!users.length) return [];
    return Array.from(
      new Set(users.map(user => user.metadata.source).filter(Boolean))
    ).sort() as string[];
  }, [users]);

  // Calculate statistics by locale (average storage usage, etc.)
  useEffect(() => {
    if (users.length === 0) return;

    // Group users by locale and calculate stats
    const localeStatsMap: Record<string, LocaleStats> = {};

    users.forEach((user) => {
      const locale = user.profile.locale;
      const storagePercent = user.storage.percentUsed || 0;

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
  }, [users]);

  // Memoize unique filter options
  const uniqueLocales = useMemo(
    () =>
      Array.from(new Set(users.map((user) => user.profile.locale))).sort() as string[],
    [users]
  );

  const uniqueSources = uniqueAuthSources;

  // Effect to build and filter graph data whenever DATA or FILTERS change
  useEffect(() => {
    console.log("useGraphData: Rebuilding graph data...");

    if (users.length === 0) {
      console.log("useGraphData: Insufficient data, setting empty graph.");
      setGraphData({ nodes: [], links: [] });
      setNeighborNodeIds(new Set());
      setNeighborLinkIds(new Set());
      return;
    }

    // --- 1. Create Base Nodes ---
    const baseNodes: GraphNode[] = users.map((user) => {
      const userLocale = user.profile.locale;
      const localeAvgStorage = localeStats[userLocale]?.averageStorage || 0;
      const localeUserCount = localeStats[userLocale]?.userCount || 0;

      return {
        id: user.userId,
        name: user.profile.name,
        locale: userLocale,
        storage: user.storage.percentUsed,
        color: LOCALE_COLORS[userLocale] || DEFAULT_LOCALE_COLOR,
        authSource: user.metadata.source || "Unknown",
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
      const locale = user.profile.locale;
      if (!usersByLocale[locale]) {
        usersByLocale[locale] = [];
      }
      usersByLocale[locale].push(user.userId);
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

    // Source Filter - filter by the single auth source
    if (filteredSource) {
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.authSource === filteredSource ||
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
    uniqueSources, // Base auth source data
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
    isLoading: isLoading && !userProfiles, // More accurate loading state
    error,
    uniqueLocales,
    uniqueSources,
    neighborNodeIds,
    neighborLinkIds,
    users, // Return users array for lookups elsewhere (e.g., legends)
    localeStats, // Export locale stats for use in other components
  };
};
