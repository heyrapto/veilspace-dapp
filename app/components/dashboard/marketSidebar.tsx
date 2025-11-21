"use client";

import * as React from "react";
import {
  AllListingsIcon,
} from "../ui/icons";
import { Loading } from "../ui/loading";
import { ErrorState } from "../ui/error-state";
import { useCategories } from "@/app/hooks/use-categories-query";

interface MarketSidebarProps {
  onCategorySelect?: (categorySlug: string | null) => void;
  scope?: "global" | "market" | "fundraiser";
}

export default function MarketSidebar({
  onCategorySelect,
  scope = "global",
}: MarketSidebarProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const { data: categories, isLoading, error, refetch } = useCategories(scope);

  const handleCategoryClick = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    onCategorySelect?.(categorySlug);
  };

  if (error) {
    return (
      <div className="w-[258px] p-2.5 rounded-[16px] border border-[#262626] bg-[#171717] shadow-[0_1px_2px_rgba(10,13,20,0.03)]">
        <ErrorState
          message={error.message || "Failed to load categories"}
          onRetry={() => refetch()}
          retryText="Retry"
        />
      </div>
    );
  }

  return (
    <div className="w-[258px] p-2.5 rounded-[16px] border border-[#262626] bg-[#171717] shadow-[0_1px_2px_rgba(10,13,20,0.03)]">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loading size="sm" />
        </div>
      ) : (
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-sm transition-colors cursor-pointer ${
              !selectedCategory
                ? "bg-[#262626] text-white"
                : "text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            <span className="shrink-0">
              <AllListingsIcon />
            </span>
            <span>All listings</span>
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-sm transition-colors cursor-pointer ${
                selectedCategory === category.slug
                  ? "bg-[#262626] text-white"
                  : "text-white/60 hover:text-white hover:bg-[#262626]"
              }`}
            >
              <span className="shrink-0">
                <AllListingsIcon />
              </span>
              <span>{category.title}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
