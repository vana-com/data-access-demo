// app/components/GraphLegends.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, Info, Link2 } from "lucide-react";
import React from "react";
import {
  DEFAULT_LOCALE_COLOR,
  DEFAULT_SOURCE_COLOR,
  LOCALE_COLORS,
  SOURCE_COLORS,
} from "../lib/constants";
import { getAuthIcon } from "../lib/graph-utils";
import { GraphLink, GraphNode } from "../types/graph";

interface GraphLegendsProps {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  graphData: { nodes: GraphNode[]; links: GraphLink[] }; // links type can be simplified here
  neighborNodeIds: Set<string>;
}

export const GraphLegends: React.FC<GraphLegendsProps> = ({
  selectedNodeId,
  hoveredNodeId,
  graphData,
  neighborNodeIds,
}) => {
  const selectedNode = selectedNodeId
    ? graphData.nodes.find((n) => n.id === selectedNodeId)
    : null;
  const hoveredNode = hoveredNodeId
    ? graphData.nodes.find((n) => n.id === hoveredNodeId)
    : null;

  // Determine the number of connections (excluding self)
  const connectionCount = selectedNodeId ? neighborNodeIds.size - 1 : 0;

  return (
    <div className="space-y-6 overflow-y-auto h-full pb-6 pr-2 lg:pr-0">
      {/* Allow scrolling */}
      {/* Node Info / Selected Node Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Info className="w-4 h-4 mr-2 text-primary" />
            Node Information
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
              <div>
                <strong>Auth Sources:</strong>
                {selectedNode.authSources.length > 0 ? (
                  <ul className="list-none pl-0 mt-1 space-y-1">
                    {selectedNode.authSources.map((src) => (
                      <li
                        key={src}
                        className="flex items-center text-muted-foreground"
                      >
                        {getAuthIcon(src)} {/* Use the utility function */}
                        {src}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground ml-1">None</span>
                )}
              </div>
              <p className="mt-2">
                <strong>Connections:</strong>
                <span className="text-muted-foreground ml-1">
                  {connectionCount >= 0 ? connectionCount : 0}
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
              <p>
                <strong>Auth Sources:</strong>
                <span className="text-muted-foreground ml-1">
                  {hoveredNode.authSources.join(", ") || "None"}
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
      {/* Source Legend Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Link2 className="w-4 h-4 mr-2 text-primary" /> Auth Source Legend
          </CardTitle>
          <CardDescription className="text-xs">
            Link colors indicate shared source
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm pt-2">
          {Object.entries(SOURCE_COLORS).map(([source, color]) => (
            <div key={source} className="flex items-center space-x-2 truncate">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              ></span>
              <span
                className="text-muted-foreground truncate flex items-center"
                title={source}
              >
                {getAuthIcon(source)} {/* Use the utility function */}
                {source}
              </span>
            </div>
          ))}
          {/* Add 'Other' entry if the default color is used */}
          {graphData.links.some((l) => l.color === DEFAULT_SOURCE_COLOR) && (
            <div className="flex items-center space-x-2 truncate">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 border border-dashed"
                style={{ backgroundColor: DEFAULT_SOURCE_COLOR }}
                aria-hidden="true"
              ></span>
              <span className="text-muted-foreground truncate" title="Other">
                Other
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
