import React from 'react';
import {
  Card as ShadcnCard,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  title,
  className = '',
  children,
  onClick,
  selected = false,
  variant = 'default'
}) => {
  const clickableStyles = onClick 
    ? 'hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer' 
    : '';
    
  const selectedStyles = selected 
    ? 'border-primary shadow-md ring-1 ring-primary/20' 
    : '';
    
  const variantStyles = variant === 'elevated' 
    ? 'shadow-md hover:shadow-lg' 
    : '';
  
  return (
    <ShadcnCard 
      className={cn(
        clickableStyles, 
        selectedStyles, 
        variantStyles,
        className
      )}
      onClick={onClick}
    >
      {title && (
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? 'pt-0' : ''}>{children}</CardContent>
    </ShadcnCard>
  );
};

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export const CardGrid: React.FC<CardGridProps> = ({ 
  children, 
  className = '',
  columns = 3
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-4',
      colsClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}; 