"use client";

import React from 'react';
import { Database } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-border/40 bg-background shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight">Vana Social Insights</h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Explore user data powered by Vana Query Engine
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}; 