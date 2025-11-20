"use client";

import { create } from "zustand";
import { apiClient, User, ApiError } from "../services.tsx/api-client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  authenticate: (walletAddress: string) => Promise<void>;
  getCurrentUser: (wallet: string) => Promise<void>;
  updateProfile: (data: {
    walletAddress: string;
    handle?: string;
    avatar?: string;
    bio?: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  authenticate: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.auth(walletAddress);
      if (response.success && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Authentication failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  getCurrentUser: async (wallet: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getMe(wallet);
      if (response.success && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch user";
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateProfile(data);
      if (response.success && response.data) {
        set({
          user: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update profile";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

