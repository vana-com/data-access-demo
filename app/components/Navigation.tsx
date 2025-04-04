"use client";

import React from 'react';
import { ViewType } from '../types';
import { useAppStore } from '../store/store';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Users, ShieldCheck, Database, Globe, Map } from 'lucide-react';

const navItems = [
  { id: 'userProfiles' as ViewType, label: 'User Profiles', icon: <Users className="h-4 w-4" /> },
  { id: 'authStats' as ViewType, label: 'Authentication Stats', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'storageUsage' as ViewType, label: 'Storage Usage', icon: <Database className="h-4 w-4" /> },
  { id: 'storageTribe' as ViewType, label: 'Storage Tribe', icon: <Map className="h-4 w-4" /> },
  { id: 'socialWeb' as ViewType, label: 'Social Web', icon: <Globe className="h-4 w-4" /> }
];

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, fetchData, isLoading } = useAppStore();

  const handleViewChange = (view: ViewType) => {
    if (isLoading) return;
    setCurrentView(view);
    fetchData(view);
  };

  return (
    <div className="border-b border-border/40 py-2 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <Tabs value={currentView} onValueChange={(value) => handleViewChange(value as ViewType)} className="w-full">
          <TabsList className="w-full bg-muted/30 p-1 rounded-md">
            {navItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                disabled={isLoading}
                className="flex-1 gap-2 py-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <span className="flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="hidden sm:inline font-medium">{item.label}</span>
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