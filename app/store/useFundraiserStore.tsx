"use client";

import { create } from "zustand";
import {
  apiClient,
  Fundraiser,
  FundraiserListParams,
  CreateFundraiserRequest,
  UpdateFundraiserRequest,
  DonateRequest,
  Donation,
  ApiError,
} from "../services.tsx/api-client";

interface FundraiserState {
  fundraisers: Fundraiser[];
  currentFundraiser: Fundraiser | null;
  donations: Donation[];
  donationsPagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null;
  filters: {
    category?: string;
    sort?: "trending" | "ending_soon" | "raised" | "new";
    search?: string;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFundraisers: (params?: FundraiserListParams) => Promise<void>;
  fetchFundraiserById: (id: string) => Promise<void>;
  createFundraiser: (data: CreateFundraiserRequest) => Promise<Fundraiser>;
  updateFundraiser: (id: string, data: UpdateFundraiserRequest) => Promise<Fundraiser>;
  deleteFundraiser: (id: string) => Promise<void>;
  donate: (id: string, data: DonateRequest) => Promise<Donation>;
  fetchDonations: (id: string, page?: number, pageSize?: number) => Promise<void>;
  setFilters: (filters: Partial<FundraiserState["filters"]>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useFundraiserStore = create<FundraiserState>((set, get) => ({
  fundraisers: [],
  currentFundraiser: null,
  donations: [],
  donationsPagination: null,
  pagination: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchFundraisers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedParams: FundraiserListParams = {
        ...currentFilters,
        ...params,
      };

      const response = await apiClient.getFundraisers(mergedParams);
      if (response.success && response.data) {
        set({
          fundraisers: response.data.items,
          pagination: response.data.pagination,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch fundraisers";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchFundraiserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getFundraiserById(id);
      if (response.success && response.data) {
        const fundraiser = response.data;
        set((state) => {
          const exists = state.fundraisers.find((f) => f.id === fundraiser.id);
          return {
            fundraisers: exists
              ? state.fundraisers.map((f) => (f.id === fundraiser.id ? fundraiser : f))
              : [...state.fundraisers, fundraiser],
            currentFundraiser: fundraiser,
            isLoading: false,
            error: null,
          };
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch fundraiser";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createFundraiser: async (data: CreateFundraiserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createFundraiser(data);
      if (response.success && response.data) {
        const newFundraiser = response.data;
        set((state) => ({
          fundraisers: [newFundraiser, ...state.fundraisers],
          isLoading: false,
          error: null,
        }));
        return newFundraiser;
      }
      throw new Error("Failed to create fundraiser");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to create fundraiser";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateFundraiser: async (id: string, data: UpdateFundraiserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateFundraiser(id, data);
      if (response.success && response.data) {
        const updatedFundraiser = response.data;
        set((state) => ({
          fundraisers: state.fundraisers.map((f) =>
            f.id === id ? updatedFundraiser : f
          ),
          currentFundraiser:
            state.currentFundraiser?.id === id ? updatedFundraiser : state.currentFundraiser,
          isLoading: false,
          error: null,
        }));
        return updatedFundraiser;
      }
      throw new Error("Failed to update fundraiser");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update fundraiser";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteFundraiser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteFundraiser(id);
      set((state) => ({
        fundraisers: state.fundraisers.filter((f) => f.id !== id),
        currentFundraiser:
          state.currentFundraiser?.id === id ? null : state.currentFundraiser,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to delete fundraiser";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  donate: async (id: string, data: DonateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.donateToFundraiser(id, data);
      if (response.success && response.data) {
        const donation = response.data;
        // Update fundraiser raised amount
        set((state) => ({
          fundraisers: state.fundraisers.map((f) => {
            if (f.id === id) {
              return {
                ...f,
                raised: f.raised + donation.amount,
              };
            }
            return f;
          }),
          currentFundraiser:
            state.currentFundraiser?.id === id
              ? {
                  ...state.currentFundraiser,
                  raised: state.currentFundraiser.raised + donation.amount,
                }
              : state.currentFundraiser,
          donations: [donation, ...state.donations],
          isLoading: false,
          error: null,
        }));
        return donation;
      }
      throw new Error("Failed to donate");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to donate";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchDonations: async (id: string, page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getFundraiserDonations(id, page, pageSize);
      if (response.success && response.data) {
        set({
          donations: response.data.donations,
          donationsPagination: response.data.pagination,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch donations";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => {
    set({ error: null });
  },
}));

