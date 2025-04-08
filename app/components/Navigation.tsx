"use client";

import React from "react";
import { ViewType } from "../types";
import { useAppStore } from "../store/store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Users, Globe } from "lucide-react";

const navItems = [
  {
    id: "userProfiles" as ViewType,
    label: "User Profiles",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "storageWeb" as ViewType,
    label: "Storage Web",
    icon: <Globe className="h-4 w-4" />,
  },
];

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, loadData, isLoading } = useAppStore();

  const handleViewChange = (view: ViewType) => {
    if (isLoading) return;
    setCurrentView(view);
    loadData();
  };

  return (
    <div className="border-b border-border/40 py-2 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <Tabs
          value={currentView}
          onValueChange={(value) => handleViewChange(value as ViewType)}
          className="w-full"
        >
          <TabsList className="w-full bg-muted/30 p-1 rounded-md">
            {navItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                disabled={isLoading}
                className="flex-1 gap-2 py-2 h-auto cursor-pointer data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <span className="flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="hidden sm:inline font-medium">
                  {item.label}
                </span>
                {isLoading && currentView === item.id && (
                  <Spinner className="ml-1" size="sm" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
