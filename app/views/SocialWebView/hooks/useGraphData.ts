// app/hooks/useGraphData.ts
import { useAppStore } from "@/app/store/store";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE_COLOR,
  DEFAULT_SOURCE_COLOR,
  LOCALE_COLORS,
  SOURCE_COLORS,
} from "../lib/constants";
import { GraphLink, GraphNode } from "../types/graph";
import { mockAuthSources } from "@/app/lib/mockData";
import { mockUsers } from "@/app/lib/mockData";

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
  const { userProfiles, storageUsage, fetchData, isLoading, error } =
    useAppStore();

  // Fetch data on mount if not already loaded
  useEffect(() => {
    if (!userProfiles && !isLoading) {
      console.log("useGraphData: Fetching userProfiles");
      fetchData("userProfiles");
    }
    if (!storageUsage && !isLoading) {
      console.log("useGraphData: Fetching storageUsage");
      fetchData("storageUsage");
    }
  }, [userProfiles, storageUsage, fetchData, isLoading]);

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

  // Memoize base data processing (users, auth sources, storage)
  const users = useMemo(() => {
    // Use mock data as fallback if store data is unavailable
    if (!userProfiles || userProfiles.length === 0) {
      console.warn(
        "useGraphData: No user profiles found in store, using mock data."
      );
      return mockUsers;
    }
    return userProfiles;
  }, [userProfiles]);

  // Using mockAuthSources directly as per original logic
  const authSourcesData = useMemo(() => {
    console.log("useGraphData: Using mockAuthSources.");
    return (
      mockAuthSources.map((auth) => ({
        user_id: auth.user_id,
        source: auth.source,
        collection_date: auth.collection_date, // Keep date if needed later
      })) || []
    );
  }, []); // No dependencies, as it uses mock data

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

  // Effect to build and filter graph data whenever dependencies change
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

    const baseNodes: GraphNode[] = users.map((user) => ({
      id: user.user_id,
      name: user.name,
      locale: user.locale,
      storage: userStorageMap.get(user.user_id),
      color: LOCALE_COLORS[user.locale] || DEFAULT_LOCALE_COLOR,
      authSources: userAuthSourcesMap.get(user.user_id) || [],
    }));

    // --- 2. Create Base Links ---
    const usersBySource: Record<string, string[]> = {};
    authSourcesData.forEach((auth) => {
      if (!usersBySource[auth.source]) usersBySource[auth.source] = [];
      // Ensure user exists in baseNodes before adding
      if (baseNodes.some((n) => n.id === auth.user_id)) {
        usersBySource[auth.source].push(auth.user_id);
      }
    });

    const baseLinks: GraphLink[] = [];
    const linkSet = new Set<string>(); // Avoid duplicates (A-B vs B-A for same source)

    Object.entries(usersBySource).forEach(([source, userIds]) => {
      for (let i = 0; i < userIds.length; i++) {
        for (let j = i + 1; j < userIds.length; j++) {
          const sourceId = userIds[i];
          const targetId = userIds[j];
          const linkId1 = `${sourceId}-${targetId}-${source}`;
          const linkId2 = `${targetId}-${sourceId}-${source}`;

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

    // --- 3. Apply Filters ---
    let filteredNodes = [...baseNodes];
    let filteredLinks = [...baseLinks];
    const lowerQuery = searchQuery.toLowerCase().trim();

    // Locale Filter
    if (filteredLocale) {
      filteredNodes = filteredNodes.filter(
        (node) => node.locale === filteredLocale
      );
    }

    // Source Filter
    if (filteredSource) {
      filteredLinks = filteredLinks.filter(
        (link) => link.source_type === filteredSource
      );
      const connectedNodeIds = new Set([
        ...filteredLinks.map((link) => link.source),
        ...filteredLinks.map((link) => link.target),
      ]);
      // Keep nodes that are part of the filtered links OR match the locale filter (if applied)
      filteredNodes = filteredNodes.filter(
        (node) =>
          connectedNodeIds.has(node.id) ||
          (filteredLocale && node.locale === filteredLocale)
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

    // --- 4. Calculate Neighbors for Highlighting ---
    const newNeighborNodeIds = new Set<string>();
    const newNeighborLinkIds = new Set<GraphLink>();

    if (selectedNodeId && filteredNodeIds.has(selectedNodeId)) {
      newNeighborNodeIds.add(selectedNodeId); // Selected node is its own neighbor

      filteredLinks.forEach((link) => {
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
    }

    // --- 5. Update State ---
    setGraphData({ nodes: filteredNodes, links: filteredLinks });
    setNeighborNodeIds(newNeighborNodeIds);
    setNeighborLinkIds(newNeighborLinkIds);
  }, [
    users, // Base user data
    authSourcesData, // Base auth source data
    storageMetricsData, // Base storage data
    filteredLocale, // Filter criteria
    filteredSource, // Filter criteria
    searchQuery, // Filter criteria
    selectedNodeId, // Selection criteria (for neighbors)
  ]);

  return {
    graphData,
    isLoading: isLoading && (!userProfiles || !storageUsage), // More accurate loading state
    error,
    uniqueLocales,
    uniqueSources,
    neighborNodeIds,
    neighborLinkIds,
    users, // Return users array for lookups elsewhere (e.g., legends)
  };
};
