import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  iconColor = "text-primary",
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border/60 shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn("p-2 rounded-md bg-muted/60", iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-3">
          <h2 className="text-3xl font-bold">{value}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {trend && trendValue && (
          <div className="mt-4 flex items-center">
            <div
              className={cn(
                "text-xs font-medium flex items-center rounded-full px-2 py-0.5",
                {
                  "bg-emerald-100 text-emerald-700": trend === "up",
                  "bg-rose-100 text-rose-700": trend === "down",
                  "bg-muted text-muted-foreground": trend === "neutral",
                }
              )}
            >
              {trend === "up" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trend === "down" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trendValue}
            </div>
            <p className="text-xs text-muted-foreground ml-2">compared to previous period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 