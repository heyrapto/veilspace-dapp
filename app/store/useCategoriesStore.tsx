"use client";

import { create } from "zustand";
import {
  apiClient,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiError,
} from "../services.tsx/api-client";

interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (scope?: "global" | "market" | "fundraiser") => Promise<void>;
  fetchCategoryBySlug: (slug: string) => Promise<void>;
  createCategory: (data: CreateCategoryRequest) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryRequest) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async (scope) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getCategories(scope);
      if (response.success && response.data) {
        set({
          categories: response.data,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch categories";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchCategoryBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getCategoryBySlug(slug);
      if (response.success && response.data) {
        const category = response.data;
        set((state) => {
          const exists = state.categories.find((c) => c.id === category.id);
          return {
            categories: exists
              ? state.categories.map((c) => (c.id === category.id ? category : c))
              : [...state.categories, category],
            selectedCategory: category,
            isLoading: false,
            error: null,
          };
        });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to fetch category";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createCategory: async (data: CreateCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createCategory(data);
      if (response.success && response.data) {
        const newCategory = response.data;
        set((state) => ({
          categories: [...state.categories, newCategory],
          isLoading: false,
          error: null,
        }));
        return newCategory;
      }
      throw new Error("Failed to create category");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to create category";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateCategory: async (id: string, data: UpdateCategoryRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateCategory(id, data);
      if (response.success && response.data) {
        const updatedCategory = response.data;
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? updatedCategory : c
          ),
          selectedCategory:
            state.selectedCategory?.id === id ? updatedCategory : state.selectedCategory,
          isLoading: false,
          error: null,
        }));
        return updatedCategory;
      }
      throw new Error("Failed to update category");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update category";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        selectedCategory:
          state.selectedCategory?.id === id ? null : state.selectedCategory,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to delete category";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setSelectedCategory: (category: Category | null) => {
    set({ selectedCategory: category });
  },

  clearError: () => {
    set({ error: null });
  },
}));

