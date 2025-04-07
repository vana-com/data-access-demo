"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database, Globe, Info } from "lucide-react";
import React from "react";
import { DEFAULT_LOCALE_COLOR, LOCALE_COLORS } from "../lib/constants";
import { GraphLink, GraphNode, LocaleStats } from "../types/graph";

interface GraphLegendsProps {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  graphData: { nodes: GraphNode[]; links: GraphLink[] }; // links type can be simplified here
  localeStats?: Record<string, LocaleStats>; // Add locale stats
}

export const GraphLegends: React.FC<GraphLegendsProps> = ({
  selectedNodeId,
  hoveredNodeId,
  graphData,
  localeStats = {}, // Default to empty object
}) => {
  const selectedNode = selectedNodeId
    ? graphData.nodes.find((n) => n.id === selectedNodeId)
    : null;
  const hoveredNode = hoveredNodeId
    ? graphData.nodes.find((n) => n.id === hoveredNodeId)
    : null;

  return (
    <div className="space-y-6 overflow-y-auto h-full pb-6 pr-2 lg:pr-0">
      {/* Allow scrolling */}
      {/* Node Info / Selected Node Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Info className="w-4 h-4 mr-2 text-primary" />
            User Information
          </CardTitle>
          <CardDescription className="text-xs">
            {selectedNodeId
              ? "Details for selected user"
              : hoveredNodeId
              ? "Details for hovered user"
              : "Hover over or select a node"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {selectedNode ? (
            // Display selected node info
            <>
              <p>
                <strong>ID:</strong>{" "}
                <span className="text-muted-foreground break-all">
                  {selectedNode.id}
                </span>
              </p>
              <p>
                <strong>Name:</strong>{" "}
                <span className="font-medium">{selectedNode.name}</span>
              </p>
              <p>
                <strong>Locale:</strong>
                <span className="inline-flex items-center ml-1">
                  <span
                    className="w-3 h-3 rounded-full mr-1.5 flex-shrink-0"
                    style={{ backgroundColor: selectedNode.color }}
                    aria-hidden="true"
                  ></span>
                  {selectedNode.locale}
                </span>
              </p>
              <p>
                <strong>Storage Used:</strong>
                <span className="text-muted-foreground ml-1">
                  {selectedNode.storage !== undefined
                    ? `${selectedNode.storage.toFixed(1)}%`
                    : "N/A"}
                </span>
              </p>
            </>
          ) : hoveredNode ? (
            // Display hovered node info (simplified)
            <>
              <p>
                <strong>ID:</strong>{" "}
                <span className="text-muted-foreground break-all">
                  {hoveredNode.id}
                </span>
              </p>
              <p>
                <strong>Name:</strong>{" "}
                <span className="font-medium">{hoveredNode.name}</span>
              </p>
              <p>
                <strong>Locale:</strong>
                <span className="inline-flex items-center ml-1">
                  <span
                    className="w-3 h-3 rounded-full mr-1.5 flex-shrink-0"
                    style={{ backgroundColor: hoveredNode.color }}
                    aria-hidden="true"
                  ></span>
                  {hoveredNode.locale}
                </span>
              </p>
            </>
          ) : (
            // Placeholder when nothing is selected or hovered
            <p className="text-muted-foreground italic">
              No node selected or hovered.
            </p>
          )}
        </CardContent>
      </Card>
      {/* Locale Legend Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Globe className="w-4 h-4 mr-2 text-primary" /> Locale Legend
          </CardTitle>
          <CardDescription className="text-xs">
            Node colors indicate locale
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm pt-2">
          {Object.entries(LOCALE_COLORS).map(([locale, color]) => (
            <div key={locale} className="flex items-center space-x-2 truncate">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              ></span>
              <span className="text-muted-foreground truncate" title={locale}>
                {locale}
              </span>
            </div>
          ))}
          {/* Add 'Other' entry if the default color is used */}
          {graphData.nodes.some((n) => n.color === DEFAULT_LOCALE_COLOR) && (
            <div className="flex items-center space-x-2 truncate">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 border border-dashed" // Indicate default/fallback
                style={{ backgroundColor: DEFAULT_LOCALE_COLOR }}
                aria-hidden="true"
              ></span>
              <span className="text-muted-foreground truncate" title="Other">
                Other
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Storage Usage by Locale Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Database className="w-4 h-4 mr-2 text-primary" /> Storage by Locale
          </CardTitle>
          <CardDescription className="text-xs">
            Average storage usage per locale
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-2">
            {Object.entries(localeStats)
              .sort((a, b) => b[1].averageStorage - a[1].averageStorage) // Sort by average storage (highest first)
              .map(([locale, stats]) => (
                <div key={locale} className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        LOCALE_COLORS[locale] || DEFAULT_LOCALE_COLOR,
                    }}
                    aria-hidden="true"
                  ></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs font-medium truncate"
                        title={locale}
                      >
                        {locale}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stats.userCount} users
                      </span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(stats.averageStorage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-0.5 text-muted-foreground">
                      {stats.averageStorage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}

            {Object.keys(localeStats).length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No storage data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
