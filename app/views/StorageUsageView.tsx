import React, { useEffect } from 'react';
import { useAppStore } from '../store/store';
import { Card } from '../components/ui/Card';
import { LoadingOverlay } from '../components/ui/Spinner';
import { formatDate, formatPercentage } from '../lib/utils';
import { mockStorageUsageData } from '../lib/mockData';

// Helper function to get color based on percentage
const getColorForPercentage = (percent: number): string => {
  if (percent < 50) return 'bg-green-500';
  if (percent < 75) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const StorageUsageView: React.FC = () => {
  const { storageUsage, fetchData, isLoading, error } = useAppStore();

  useEffect(() => {
    if (!storageUsage && !isLoading) {
      console.log('StorageUsageView: No data found, fetching');
      fetchData('storageUsage');
    } else {
      console.log('StorageUsageView: Data already loaded or loading in progress');
    }
  }, [storageUsage, fetchData, isLoading]);

  // Use mock data directly for the demo if store data is not available
  const displayData = storageUsage || mockStorageUsageData;
  
  console.log('StorageUsageView render state:', { storageUsage, isLoading, error, displayData });

  if (isLoading) {
    return <LoadingOverlay message="Loading storage usage data..." />;
  }

  if (error) {
    return (
      <Card className="p-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => fetchData('storageUsage')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
        >
          Retry
        </button>
      </Card>
    );
  }

  // Calculate average usage
  const averageUsage = displayData.reduce((sum, item) => sum + item.percent_used, 0) / displayData.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Storage Usage</h2>
        <p className="text-sm text-text-muted">
          Average usage: {formatPercentage(averageUsage)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-table-header">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Usage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-card-bg divide-y divide-border">
            {displayData.map((usage) => (
              <tr key={usage.user_id} className="hover:bg-table-row-hover">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-foreground">{usage.name}</div>
                      <div className="text-sm text-text-muted">{usage.user_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    <div className="text-sm text-foreground font-medium">
                      {formatPercentage(usage.percent_used)}
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className={`${getColorForPercentage(usage.percent_used)} h-2 rounded-full`} 
                        style={{ width: `${usage.percent_used}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                  {formatDate(usage.recorded_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => fetchData('storageUsage')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          disabled={isLoading}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}; 