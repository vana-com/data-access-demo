"use client";

import { Card } from "@/components/ui/card";
import { DashboardContainer } from "@/components/ui/dashboard-container";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { useAppStore } from "./store/store";
import { StorageWebView } from "./views/StorageWebView/StorageWebView";
import { UserProfilesView } from "./views/UserProfilesView";

export default function Home() {
  const { currentView, loadData } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Render the current view based on the state
  const renderCurrentView = () => {
    console.log(`Rendering view: ${currentView}`);

    switch (currentView) {
      case "userProfiles":
        return <UserProfilesView />;
      case "storageWeb":
        return <StorageWebView />;
      default:
        return <UserProfilesView />;
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      {/* <Header /> */}
      <Navigation />

      <main className="container max-w-7xl mx-auto px-4 py-6">
        <Card className="border border-border/60 shadow-sm p-6">
          <DashboardContainer>{renderCurrentView()}</DashboardContainer>
        </Card>
      </main>

      <footer className="border-t border-border/40 py-8 mt-10">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center gap-2">
            <Separator className="mb-4 w-1/3" />
            <p className="text-sm text-muted-foreground text-center">
              Powered by Vana Query Engine
            </p>
            <p className="text-xs text-muted-foreground/60">
              Data Access Demo — {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
