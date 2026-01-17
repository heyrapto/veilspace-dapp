"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  MarketListParams,
  CreateMarketItemRequest,
  UpdateMarketItemRequest,
  PurchaseRequest,
} from "../services.tsx/api-client";

// Query Keys
export const marketKeys = {
  all: ["market"] as const,
  lists: () => [...marketKeys.all, "list"] as const,
  list: (params?: MarketListParams) => [...marketKeys.lists(), params] as const,
  details: () => [...marketKeys.all, "detail"] as const,
  detail: (id: string) => [...marketKeys.details(), id] as const,
};

// Queries
export function useMarketItems(params?: MarketListParams) {
  return useQuery({
    queryKey: marketKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getMarketItems(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

export function useMarketItem(id: string) {
  return useQuery({
    queryKey: marketKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getMarketItemById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// Mutations
export function useCreateMarketItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMarketItemRequest) => {
      const response = await apiClient.createMarketItem(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}

export function useUpdateMarketItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMarketItemRequest;
    }) => {
      const response = await apiClient.updateMarketItem(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
      if (data) {
        queryClient.invalidateQueries({ queryKey: marketKeys.detail(data.id) });
      }
    },
  });
}

export function useDeleteMarketItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteMarketItem(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}

export function usePurchaseMarketItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: PurchaseRequest;
    }) => {
      const response = await apiClient.purchaseMarketItem(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: marketKeys.detail(variables.id),
      });
    },
  });
}

