import { NodeObject, LinkObject } from "react-force-graph-2d";

/**
 * Interface for locale statistics
 */
export interface LocaleStats {
  averageStorage: number;
  userCount: number;
  locale?: string;
}

/**
 * Represents a node in the social graph.
 */
export interface GraphNode {
  id: string; // Unique identifier (e.g., user_id)
  name: string; // Display name
  locale: string; // User's locale (e.g., 'en-US')
  storage?: number; // Optional storage usage percentage
  color: string; // Color determined by locale
  isFiltered?: boolean; // Flag indicating if node passes current filters
  authSource: string; // Single authentication source used by the user
  x?: number; // X coordinate assigned by force graph engine
  y?: number; // Y coordinate assigned by force graph engine
  localeStats?: LocaleStats; // Statistics about the node's locale group
}

/**
 * Represents a link (connection) between two nodes in the social graph.
 * The source/target can be either string IDs (when defining the graph)
 * or node objects (after the force graph library processes them).
 */
export interface GraphLink {
  source: string | ForceGraphNodeObject; // ID or node object
  target: string | ForceGraphNodeObject; // ID or node object
  value: number; // Strength or weight of the connection
  source_type: string; // The shared authentication source creating the link
  color: string; // Color determined by the source_type
  localeStats?: {
    // Statistics about the locale forming this connection
    averageStorage: string;
    userCount: number;
    locale: string;
  };
}

/**
 * Extends GraphNode with properties added by react-force-graph-2d.
 * Used specifically for canvas painting functions.
 */
export interface ForceGraphNodeObject
  extends Omit<NodeObject, "id">,
    GraphNode {
  // NodeObject properties from react-force-graph-2d
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  // GraphNode already defines id as string
}

/**
 * Type definition for links as passed to react-force-graph-2d canvas functions.
 * Note: react-force-graph-2d types links generically. We cast inside paint functions.
 */
export interface ForceGraphLinkObject extends LinkObject {
  // The library types source/target as string | number | NodeObject.
  // In canvas functions, they are resolved to NodeObjects.
  source: ForceGraphNodeObject | string | number;
  target: ForceGraphNodeObject | string | number;
  // Include our custom properties for access within paint functions
  value?: number;
  source_type?: string;
  color?: string;
  localeStats?: {
    averageStorage: string;
    userCount: number;
    locale: string;
  };
}
