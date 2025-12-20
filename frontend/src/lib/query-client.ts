import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Shorter stale time for event day - data should be fresh
      staleTime: 1000 * 30, // 30 seconds
      // Cache data for 5 minutes even if stale
      gcTime: 1000 * 60 * 5, // 5 minutes (was cacheTime)
      // Retry failed requests with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Keep refetching if network is available
      refetchOnReconnect: true,
      // Network mode - always try to fetch if online
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

