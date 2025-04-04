import React from 'react';
import { JobResultResponse } from '../types';
import { formatDate, formatDuration } from '../lib/utils';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Server, MemoryStick, LineChart, FileDown, Calendar } from 'lucide-react';

interface MetadataCardProps {
  jobResult: JobResultResponse | null;
  className?: string;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({ 
  jobResult,
  className = '' 
}) => {
  if (!jobResult) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", label: string }> = {
      "completed": { variant: "default", label: "Completed" },
      "failed": { variant: "destructive", label: "Failed" },
      "running": { variant: "secondary", label: "Running" },
      "pending": { variant: "outline", label: "Pending" }
    };
    
    const config = statusMap[status.toLowerCase()] || { variant: "outline", label: status };
    
    return (
      <Badge variant={config.variant}>{config.label}</Badge>
    );
  };

  return (
    <Card className={`border border-border/60 shadow-sm ${className}`}>
      <CardHeader className="pb-2 space-y-0 bg-muted/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Query Metadata</CardTitle>
          {getStatusBadge(jobResult.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center space-x-2 bg-muted/20 p-2 rounded-md">
            <div className="bg-muted/40 p-1.5 rounded">
              <Server className="text-primary h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-muted-foreground">Compute</p>
              <p className="font-medium">
                {jobResult.compute?.instance_type || 'N/A'} ({jobResult.compute?.region || 'N/A'})
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-muted/20 p-2 rounded-md">
            <div className="bg-muted/40 p-1.5 rounded">
              <MemoryStick className="text-primary h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-muted-foreground">Resources</p>
              <p className="font-medium">
                {jobResult.usage?.memory_mb || 0} MB Memory
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-muted/20 p-2 rounded-md">
            <div className="bg-muted/40 p-1.5 rounded">
              <LineChart className="text-primary h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">
                {formatDuration(jobResult.usage?.duration_ms || 0)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-muted/20 p-2 rounded-md">
            <div className="bg-muted/40 p-1.5 rounded">
              <Clock className="text-primary h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
        
        {jobResult.artifacts && jobResult.artifacts.length > 0 && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="text-xs font-medium mb-2 flex items-center">
                <FileDown className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Artifacts Available
              </h4>
              <div className="text-xs space-y-2">
                {jobResult.artifacts.map((artifact) => (
                  <div key={artifact.id} className="flex justify-between items-center p-2 rounded-md bg-muted/20 border border-border/40">
                    <span className="font-medium">{artifact.file_name}</span>
                    <div className="flex items-center text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        Expires: {formatDate(artifact.expires_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 