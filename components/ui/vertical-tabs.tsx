import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface VerticalTabsProps {
  tabs: {
    id: string;
    label: string;
    icon?: LucideIcon;
    disabled?: boolean;
  }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function VerticalTabs({
  tabs,
  value,
  onChange,
  className,
}: VerticalTabsProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1 border-r pr-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === value;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "transition-colors",
              isActive && "bg-accent text-accent-foreground",
              tab.disabled && "pointer-events-none opacity-50",
              !isActive && "text-muted-foreground"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "mr-2 h-4 w-4",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
            )}
            <span>{tab.label}</span>
            {isActive && (
              <span
                className={cn(
                  "ml-auto h-5 w-1 rounded-l-full bg-primary"
                )}
              ></span>
            )}
          </button>
        );
      })}
    </div>
  );
} 