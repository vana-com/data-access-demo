// app/views/AuthStatsView.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { useAppStore } from "../store/store";
import { LoadingOverlay } from "../components/ui/Spinner"; // Assuming Spinner exists
import { formatNumber } from "../lib/utils"; // Assuming utility exists
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { AuthStat } from "../types"; // Assuming type exists
import { mockAuthStats } from "../lib/mockData"; // Using mock data as fallback
import { AlertTriangle, RefreshCw } from "lucide-react"; // Icons for error/refresh
import {
  DEFAULT_SOURCE_COLOR,
  SOURCE_COLORS,
} from "./SocialWebView/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- Helper: Get Color for Auth Source ---
/**
 * Retrieves the defined color for an authentication source or returns a default color.
 * @param source - The name of the authentication source.
 * @returns The corresponding color string (hex/hsl).
 */
const getSourceColor = (source: string): string => {
  return SOURCE_COLORS[source] || DEFAULT_SOURCE_COLOR;
};

// --- Sub-component: Custom Chart Tooltip ---
interface AuthTooltipPayload extends AuthStat {
  color: string; // Add color to payload for tooltip use
}

const AuthTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length > 0) {
    // Explicitly cast payload to include our custom properties
    const data = payload[0].payload as AuthTooltipPayload;
    const total = payload[0].payload.totalAuthSources; // Access total passed in payload

    if (!data || typeof total !== "number") return null; // Guard against missing data

    const percentage =
      total > 0 ? ((data.count / total) * 100).toFixed(1) : "0.0";

    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-lg text-sm">
        <div className="flex items-center mb-1">
          <span
            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: data.color }} // Use color from payload
            aria-hidden="true"
          ></span>
          <p className="font-medium text-foreground">{data.source}</p>
        </div>
        <p className="text-muted-foreground">
          Count: {formatNumber(data.count)}
        </p>
        <p className="text-muted-foreground">Percentage: {percentage}%</p>
      </div>
    );
  }
  return null;
};

// --- Sub-component: Statistics Table ---
interface AuthTableProps {
  data: (AuthStat & { color: string; percentage: number })[]; // Data with calculated color/percentage
}

const AuthTable: React.FC<AuthTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-center">
        No statistics available.
      </p>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Apply overflow hidden to card for rounded corners */}
      <div className="overflow-x-auto">
        {/* Allow horizontal scroll on small screens */}
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            {/* Use muted background for header */}
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Auth Source
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Count
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {data.map((stat) => (
              <tr
                key={stat.source}
                className="hover:bg-muted/30 transition-colors duration-150"
              >
                {/* Source Name + Color Indicator */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2.5 flex-shrink-0"
                      style={{ backgroundColor: stat.color }} // Use pre-calculated color
                      aria-hidden="true"
                    />
                    {stat.source}
                  </div>
                </td>
                {/* Count */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatNumber(stat.count)}
                </td>
                {/* Percentage */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {stat.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// --- Main View Component ---
export const AuthStatsView: React.FC = () => {
  // Fetch data from Zustand store
  const { authStats, fetchData, isLoading, error } = useAppStore();

  // Effect to fetch data on mount if needed
  useEffect(() => {
    if (!authStats && !isLoading) {
      console.log("AuthStatsView: No data found, fetching");
      fetchData("authStats");
    }
    // Removed else block as it's not strictly necessary
  }, [authStats, fetchData, isLoading]);

  // Memoize processed data for chart and table
  const processedData = useMemo(() => {
    // Use mock data as fallback if store data is unavailable
    const currentData =
      authStats && authStats.length > 0 ? authStats : mockAuthStats;
    console.log(
      "AuthStatsView using data:",
      currentData === mockAuthStats ? "Mock Data" : "Store Data"
    );

    if (!currentData || currentData.length === 0)
      return { tableData: [], chartData: [], total: 0 };

    const total = currentData.reduce((sum, stat) => sum + stat.count, 0);

    const dataWithDetails = currentData.map((stat) => ({
      ...stat,
      color: getSourceColor(stat.source), // Get color using the helper
      percentage: total > 0 ? (stat.count / total) * 100 : 0,
      totalAuthSources: total, // Pass total for tooltip calculation
    }));

    // Sort data for consistent display (e.g., by count descending)
    dataWithDetails.sort((a, b) => b.count - a.count);

    return {
      tableData: dataWithDetails, // Data for the table
      chartData: dataWithDetails, // Data for the chart (can be same or further processed if needed)
      total: total, // Total count
    };
  }, [authStats]); // Recalculate when authStats changes

  // --- Loading State ---
  if (isLoading) {
    return <LoadingOverlay message="Loading authentication statistics..." />;
  }

  // --- Error State ---
  if (error) {
    return (
      <Card className="p-6 border border-destructive bg-destructive/10">
        <div className="flex items-center text-destructive mb-3">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-semibold">Loading Error</h3>
        </div>
        <p className="text-destructive/80 text-sm mb-4">
          Could not load authentication statistics. Please try again.
          <br />
          <span className="text-xs mt-1 block">
            Details: {typeof error === "string" ? error : JSON.stringify(error)}
          </span>
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => fetchData("authStats")}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  // --- Render View ---
  return (
    <div className="space-y-6 p-1">
      {/* Add small padding */}
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Authentication Statistics
        </h2>
        <p className="text-sm text-muted-foreground">
          Total Sources: {formatNumber(processedData.total)}
        </p>
      </div>
      {/* Grid for Chart and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card */}
        <Card className="p-4 h-80">
          {/* Fixed height for consistency */}
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base font-medium text-foreground">
              Sources Distribution
            </CardTitle>
          </CardHeader>
          <CardContent
            className="p-0 h-[calc(100%-40px)]"
            aria-label="Authentication sources distribution bar chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData.chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                {/* Adjusted margins */}
                <XAxis
                  dataKey="source"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10} // Smaller font size for axis labels
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatNumber(value)}`} // Format Y-axis numbers
                />
                <Tooltip
                  content={<AuthTooltip />}
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }} // Subtle hover effect
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {/* Rounded top corners */}
                  {processedData.chartData.map((entry) => (
                    <Cell key={`cell-${entry.source}`} fill={entry.color} /> // Use color from processed data
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Table Component */}
        <div className="col-span-1 lg:col-span-1">
          <AuthTable data={processedData.tableData} />
        </div>
      </div>
      {/* Refresh Button */}
      <div className="flex justify-end mt-4">
        <Button
          onClick={() => fetchData("authStats")}
          variant="outline" // Use outline variant
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

// Optional: Export default if this is the main export of the file
// export default AuthStatsView;
