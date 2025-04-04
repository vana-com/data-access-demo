import { Spinner as CustomSpinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export const Spinner = CustomSpinner;

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading data...', 
  className 
}) => {
  return (
    <Card className={cn(
      "border border-border/60 shadow-sm flex flex-col items-center justify-center p-8 h-64",
      className
    )}>
      <div className="bg-muted/20 p-4 rounded-full">
        <CustomSpinner size="lg" className="text-primary" />
      </div>
      <p className="text-muted-foreground text-center text-sm mt-4">
        {message}
      </p>
    </Card>
  );
}; 