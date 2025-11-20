"use client";

import { create } from "zustand";
import {
  apiClient,
  SearchResult,
  SearchParams,
  SearchType,
  ApiError,
} from "../services.tsx/api-client";

interface SearchState {
  results: SearchResult | null;
  query: string;
  searchType: SearchType;
  category: string | null;
  isLoading: boolean;
  error: string | null;
  lastSearch: string | null;

  // Actions
  search: (params: SearchParams) => Promise<void>;
  setQuery: (query: string) => void;
  setSearchType: (type: SearchType) => void;
  setCategory: (category: string | null) => void;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  results: null,
  query: "",
  searchType: "all",
  category: null,
  isLoading: false,
  error: null,
  lastSearch: null,

  search: async (params: SearchParams) => {
    if (!params.q || params.q.trim() === "") {
      set({ error: "Search query is required" });
      return;
    }

    set({ isLoading: true, error: null, lastSearch: params.q });
    try {
      const response = await apiClient.search(params);
      if (response.success && response.data) {
        set({
          results: response.data,
          query: params.q,
          searchType: params.type || "all",
          category: params.category || null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Search failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setQuery: (query: string) => {
    set({ query });
  },

  setSearchType: (type: SearchType) => {
    set({ searchType: type });
  },

  setCategory: (category: string | null) => {
    set({ category });
  },

  clearResults: () => {
    set({
      results: null,
      query: "",
      lastSearch: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

