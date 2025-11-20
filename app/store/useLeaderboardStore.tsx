"use client";

import { create } from "zustand";
import {
  apiClient,
  LeaderboardResponse,
  LeaderboardParams,
  LeaderboardScope,
  LeaderboardPeriod,
  ApiError,
} from "../services.tsx/api-client";

interface LeaderboardState {
  leaderboard: LeaderboardResponse | null;
  currentScope: LeaderboardScope | null;
  currentPeriod: LeaderboardPeriod;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLeaderboard: (params: LeaderboardParams) => Promise<void>;
  updateLeaderboards: () => Promise<void>;
  setPeriod: (period: LeaderboardPeriod) => void;
  clearError: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  leaderboard: null,
  currentScope: null,
  currentPeriod: "all_time",
  isLoading: false,
  error: null,

  fetchLeaderboard: async (params: LeaderboardParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getLeaderboard(params);
      if (response.success && response.data) {
        set({
          leaderboard: response.data,
          currentScope: params.scope,
          currentPeriod: params.period || "all_time",
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch leaderboard";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateLeaderboards: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.updateLeaderboards();
      // Optionally refetch current leaderboard after update
      const currentScope = get().currentScope;
      const currentPeriod = get().currentPeriod;
      if (currentScope) {
        await get().fetchLeaderboard({
          scope: currentScope,
          period: currentPeriod,
        });
      } else {
        set({ isLoading: false, error: null });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update leaderboards";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setPeriod: (period: LeaderboardPeriod) => {
    set({ currentPeriod: period });
    const currentScope = get().currentScope;
    if (currentScope) {
      get().fetchLeaderboard({
        scope: currentScope,
        period,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

