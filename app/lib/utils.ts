/**
 * Format a date string to a more readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number): string => {
  if (value === undefined || value === null) return '';
  return `${value.toFixed(1)}%`;
};

/**
 * Format a large number with commas
 */
export const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return '';
  return value.toLocaleString('en-US');
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Format duration in milliseconds to a readable format
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}; 