import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore } from "../store/store";

// Simple LoadingOverlay component
const LoadingOverlay = ({ message = "Loading user profiles..." }) => (
  <Card className="p-4 text-center flex flex-col items-center justify-center h-64">
    <Spinner size="lg" />
    <p className="text-muted-foreground mt-4">{message}</p>
  </Card>
);

// Helper function to get color based on percentage
const getColorForPercentage = (percent: number): string => {
  if (percent < 50) return "bg-green-500";
  if (percent < 75) return "bg-yellow-500";
  return "bg-red-500";
};

// Helper function to format timestamp to readable date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const UserProfilesView: React.FC = () => {
  const { userProfiles, loadData, isLoading, error } = useAppStore();

  useEffect(() => {
    if (!userProfiles && !isLoading) {
      console.log("UserProfilesView: No data found, fetching");
      loadData();
    } else {
      console.log(
        "UserProfilesView: Data already loaded or loading in progress"
      );
    }
  }, [userProfiles, loadData, isLoading]);

  // Use data from the store
  const displayData = userProfiles || [];

  // Calculate average storage usage
  const averageUsage =
    displayData.length > 0
      ? displayData
          .filter((user) => user.storage.percentUsed !== null)
          .reduce(
            (sum, user) => sum + parseFloat(user.storage.percentUsed),
            0
          ) / displayData.length
      : 0;

  console.log("UserProfilesView render state:", {
    userProfiles,
    isLoading,
    error,
    displayData,
  });

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <Card className="p-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => loadData()}
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
        <h2 className="text-xl font-semibold text-foreground">User Profiles</h2>
        <div className="text-sm text-text-muted flex items-center space-x-4">
          <span>{displayData.length} users found</span>
          <span>Average storage: {averageUsage.toFixed(2)}%</span>
        </div>
      </div>

      {/* User cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayData.map((user) => (
          <Card
            key={user.userId}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 border-b border-border">
              <div className="flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{user.profile.name}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary whitespace-nowrap ml-2">
                    {user.profile.locale}
                  </span>
                </div>
                <div className="w-full overflow-hidden text-ellipsis">
                  <p
                    className="text-sm text-text-muted truncate"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* User ID */}
              <div className="flex justify-between items-start text-sm">
                <span className="text-text-muted">User ID:</span>
                <span
                  className="font-mono text-xs truncate max-w-[160px] text-right"
                  title={user.userId}
                >
                  {user.userId}
                </span>
              </div>

              {/* Source */}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Source:</span>
                <span className="font-medium">
                  {user.metadata.source || "N/A"}
                </span>
              </div>

              {/* Collection Date */}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Collection Date:</span>
                <span>
                  {user.metadata.collectionDate
                    ? new Date(
                        user.metadata.collectionDate
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              {/* Timestamp */}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Created:</span>
                <span>{formatDate(parseInt(user.timestamp + 100))}</span>
              </div>

              {/* Storage Usage with visual bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Storage Usage:</span>
                  {user.storage.percentUsed ? (
                    <span className="font-medium">
                      {user.storage.percentUsed}%
                    </span>
                  ) : (
                    <span className="font-medium">N/A</span>
                  )}
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className={`${getColorForPercentage(
                      parseFloat(user.storage.percentUsed || "0")
                    )} h-2 rounded-full`}
                    style={{ width: `${user.storage.percentUsed || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
