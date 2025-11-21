"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../services.tsx/api-client";

// Query Keys
export const categoryKeys = {
  all: ["category"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (scope?: string) => [...categoryKeys.lists(), scope] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
};

// Queries
export function useCategories(scope?: "global" | "market" | "fundraiser") {
  return useQuery({
    queryKey: categoryKeys.list(scope),
    queryFn: async () => {
      const response = await apiClient.getCategories(scope);
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (categories don't change often)
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: async () => {
      const response = await apiClient.getCategoryBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

// Mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const response = await apiClient.createCategory(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryRequest;
    }) => {
      const response = await apiClient.updateCategory(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(data.slug),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteCategory(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

