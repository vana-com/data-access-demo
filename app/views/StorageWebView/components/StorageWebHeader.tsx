// app/components/StorageWebHeader.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Globe, Link2, Users, RotateCcw } from "lucide-react";

interface StorageWebHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  connectionMode: string;
  onConnectionModeChange: (value: string) => void;
  filteredLocale: string | null;
  onFilteredLocaleChange: (value: string | null) => void;
  uniqueLocales: string[];
  filteredSource: string | null;
  onFilteredSourceChange: (value: string | null) => void;
  uniqueSources: string[];
  onClearFilters: () => void;
}

export const StorageWebHeader: React.FC<StorageWebHeaderProps> = ({
  searchQuery,
  onSearchQueryChange,
  connectionMode,
  onConnectionModeChange,
  filteredLocale,
  onFilteredLocaleChange,
  uniqueLocales,
  filteredSource,
  onFilteredSourceChange,
  uniqueSources,
  onClearFilters,
}) => {
  const showClearButton = filteredLocale || filteredSource || searchQuery;

  return (
    <header className="p-3 sm:p-4 border-b bg-background/80 backdrop-blur-sm shadow-sm z-10 sticky top-0">
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center whitespace-nowrap">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary flex-shrink-0" />
          Storage Web
        </h1>

        {/* Controls */}
        <div className="flex items-center flex-wrap justify-start sm:justify-end gap-2 sm:gap-3 w-full sm:flex-grow">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              aria-label="Search users by name or ID"
              className="pl-9 pr-8 py-1 h-9 text-sm w-full sm:w-48"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full"
                onClick={() => onSearchQueryChange("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Connection Visualization Mode */}
          <Select value={connectionMode} onValueChange={onConnectionModeChange}>
            <SelectTrigger
              className="w-full sm:w-[180px] h-9 text-sm"
              aria-label="Select Connection Visualization Mode"
            >
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
              onFilteredLocaleChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger
              className="w-full sm:w-[150px] h-9 text-sm"
              aria-label="Filter by Locale"
            >
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
              onFilteredSourceChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger
              className="w-full sm:w-[160px] h-9 text-sm"
              aria-label="Filter by Authentication Source"
            >
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
          {showClearButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-9 w-full sm:w-auto"
              aria-label="Clear all filters and reset view"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear / Reset
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
