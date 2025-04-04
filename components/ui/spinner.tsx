import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        default: "h-6 w-6",
        sm: "h-4 w-4",
        lg: "h-8 w-8",
        xl: "h-10 w-10",
      },
      variant: {
        default: "text-primary",
        destructive: "text-destructive",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { Spinner, spinnerVariants }; 