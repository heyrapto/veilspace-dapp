"use client";

import { create } from "zustand";
import {
  apiClient,
  MarketItem,
  MarketListParams,
  CreateMarketItemRequest,
  UpdateMarketItemRequest,
  PurchaseRequest,
  Purchase,
  ApiError,
} from "../services.tsx/api-client";

interface MarketState {
  items: MarketItem[];
  currentItem: MarketItem | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null;
  filters: {
    category?: string;
    sort?: "trending" | "new" | "price_asc" | "price_desc";
    search?: string;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchItems: (params?: MarketListParams) => Promise<void>;
  fetchItemById: (id: string) => Promise<void>;
  createItem: (data: CreateMarketItemRequest) => Promise<MarketItem>;
  updateItem: (id: string, data: UpdateMarketItemRequest) => Promise<MarketItem>;
  deleteItem: (id: string) => Promise<void>;
  purchaseItem: (id: string, data: PurchaseRequest) => Promise<Purchase>;
  setFilters: (filters: Partial<MarketState["filters"]>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  items: [],
  currentItem: null,
  pagination: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchItems: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedParams: MarketListParams = {
        ...currentFilters,
        ...params,
      };

      const response = await apiClient.getMarketItems(mergedParams);
      if (response.success && response.data) {
        set({
          items: response.data.items,
          pagination: response.data.pagination,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch market items";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchItemById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getMarketItemById(id);
      if (response.success && response.data) {
        const item = response.data;
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);
          return {
            items: exists
              ? state.items.map((i) => (i.id === item.id ? item : i))
              : [...state.items, item],
            currentItem: item,
            isLoading: false,
            error: null,
          };
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch market item";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createItem: async (data: CreateMarketItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createMarketItem(data);
      if (response.success && response.data) {
        const newItem = response.data;
        set((state) => ({
          items: [newItem, ...state.items],
          isLoading: false,
          error: null,
        }));
        return newItem;
      }
      throw new Error("Failed to create market item");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to create market item";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateItem: async (id: string, data: UpdateMarketItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateMarketItem(id, data);
      if (response.success && response.data) {
        const updatedItem = response.data;
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? updatedItem : i)),
          currentItem: state.currentItem?.id === id ? updatedItem : state.currentItem,
          isLoading: false,
          error: null,
        }));
        return updatedItem;
      }
      throw new Error("Failed to update market item");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update market item";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteMarketItem(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        currentItem: state.currentItem?.id === id ? null : state.currentItem,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to delete market item";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  purchaseItem: async (id: string, data: PurchaseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.purchaseMarketItem(id, data);
      if (response.success && response.data) {
        // Update the item stock if needed
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id === id) {
              return {
                ...i,
                stock: Math.max(0, i.stock - (data.quantity || 1)),
                status: i.stock - (data.quantity || 1) <= 0 ? "sold_out" : i.status,
              };
            }
            return i;
          }),
          currentItem:
            state.currentItem?.id === id
              ? {
                  ...state.currentItem,
                  stock: Math.max(0, state.currentItem.stock - (data.quantity || 1)),
                  status:
                    state.currentItem.stock - (data.quantity || 1) <= 0
                      ? "sold_out"
                      : state.currentItem.status,
                }
              : state.currentItem,
          isLoading: false,
          error: null,
        }));
        return response.data;
      }
      throw new Error("Failed to purchase item");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to purchase item";
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

