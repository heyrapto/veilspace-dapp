/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  FundraiserListParams,
  CreateFundraiserRequest,
  UpdateFundraiserRequest,
  DonateRequest,
} from "../services.tsx/api-client";

// Query Keys
export const fundraiserKeys = {
  all: ["fundraiser"] as const,
  lists: () => [...fundraiserKeys.all, "list"] as const,
  list: (params?: FundraiserListParams) =>
    [...fundraiserKeys.lists(), params] as const,
  details: () => [...fundraiserKeys.all, "detail"] as const,
  detail: (id: string) => [...fundraiserKeys.details(), id] as const,
  donations: (id: string) => [...fundraiserKeys.detail(id), "donations"] as const,
};

// Queries
export function useFundraisers(params?: FundraiserListParams) {
  return useQuery({
    queryKey: fundraiserKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getFundraisers(params);
      // Handle API response structure: data.fundraisers vs data.items
      if (response.data && 'fundraisers' in response.data) {
        return {
          items: (response.data as any).fundraisers || [],
          pagination: (response.data as any).pagination || {
            page: 1,
            pageSize: 24,
            total: 0,
            totalPages: 0,
          },
        };
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useFundraiser(id: string) {
  return useQuery({
    queryKey: fundraiserKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getFundraiserById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useFundraiserDonations(id: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: fundraiserKeys.donations(id),
    queryFn: async () => {
      const response = await apiClient.getFundraiserDonations(id, page, pageSize);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });
}

// Mutations
export function useCreateFundraiser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundraiserRequest) => {
      const response = await apiClient.createFundraiser(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundraiserKeys.lists() });
    },
  });
}

export function useUpdateFundraiser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFundraiserRequest;
    }) => {
      const response = await apiClient.updateFundraiser(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fundraiserKeys.lists() });
      if (data) {
        queryClient.invalidateQueries({
          queryKey: fundraiserKeys.detail(data.id),
        });
      }
    },
  });
}

export function useDeleteFundraiser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteFundraiser(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundraiserKeys.lists() });
    },
  });
}

export function useDonateToFundraiser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: DonateRequest;
    }) => {
      const response = await apiClient.donateToFundraiser(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fundraiserKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: fundraiserKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: fundraiserKeys.donations(variables.id),
      });
    },
  });
}

