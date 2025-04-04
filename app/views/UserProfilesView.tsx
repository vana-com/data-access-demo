import React, { useEffect } from "react";
import { Card } from "../components/ui/Card";
import { LoadingOverlay } from "../components/ui/Spinner";
import { formatDate } from "../lib/utils";
import { useAppStore } from "../store/store";
import { mockUsers } from '../lib/mockData';

export const UserProfilesView: React.FC = () => {
  const { userProfiles, fetchData, isLoading, error } = useAppStore();

  useEffect(() => {
    if (!userProfiles && !isLoading) {
      console.log('UserProfilesView: No data found, fetching');
      fetchData("userProfiles");
    } else {
      console.log('UserProfilesView: Data already loaded or loading in progress');
    }
  }, [userProfiles, fetchData, isLoading]);

  // Use mock data directly for the demo if store data is not available
  const displayData = userProfiles || mockUsers;
  
  console.log('UserProfilesView render state:', { userProfiles, isLoading, error, displayData });

  if (isLoading) {
    return <LoadingOverlay message="Loading user profiles..." />;
  }

  if (error) {
    return (
      <Card className="p-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => fetchData("userProfiles")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">
          User Profiles
        </h2>
        <p className="text-sm text-text-muted">
          {displayData.length} users found
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-table-header">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
              >
                User ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
              >
                Locale
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
              >
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-card-bg divide-y divide-border">
            {displayData.map((user) => (
              <tr
                key={user.user_id}
                className="hover:bg-table-row-hover"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                  {user.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                  {user.locale}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                  {formatDate(user.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => fetchData("userProfiles")}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          disabled={isLoading}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};
