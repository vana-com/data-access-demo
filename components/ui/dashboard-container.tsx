import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface DashboardContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  className?: string;
}

export function DashboardContainer({
  children,
  title,
  description,
  headerAction,
  className,
}: DashboardContainerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description || headerAction) && (
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {(title || description || headerAction) && <Separator className="my-4" />}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({
  children,
  columns = 3,
  className,
}: DashboardGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {children}
    </div>
  );
} 