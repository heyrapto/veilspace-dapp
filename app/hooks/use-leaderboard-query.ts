"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  LeaderboardParams,
} from "../services.tsx/api-client";

// Query Keys
export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  lists: () => [...leaderboardKeys.all, "list"] as const,
  list: (params: LeaderboardParams) =>
    [...leaderboardKeys.lists(), params] as const,
};

// Queries
export function useLeaderboard(params: LeaderboardParams) {
  return useQuery({
    queryKey: leaderboardKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getLeaderboard(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutations
export function useUpdateLeaderboards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.updateLeaderboards();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.all });
    },
  });
}

