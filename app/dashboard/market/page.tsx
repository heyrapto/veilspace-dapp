"use client";

import * as React from "react";
import MarketSidebar from "../../components/dashboard/marketSidebar";
import {
  SearchIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  EyeIcon,
  InfoIcon,
  PlusIcon,
} from "../../components/ui/icons";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useSearchStore } from "@/app/store";
import { Loading } from "../../components/ui/loading";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorState } from "../../components/ui/error-state";
import { useMarketItems, useCreateMarketItem, useUpdateMarketItem, useDeleteMarketItem } from "@/app/hooks/use-market-query";
import { MarketItemModal } from "../../components/modals/market-item-modal";
import { DeleteModal } from "../../components/ui/delete-modal";
import { Button } from "../../components/ui/button";
import { MarketItem, CreateMarketItemRequest, UpdateMarketItemRequest } from "@/app/services.tsx/api-client";

export default function MarketPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const { address } = useAccount();
  const { query, search } = useSearchStore();
  const [searchInput, setSearchInput] = React.useState("");
  const [filters, setFilters] = React.useState({
    category: undefined as string | undefined,
    sort: "trending" as "trending" | "new" | "price_asc" | "price_desc",
    search: undefined as string | undefined,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MarketItem | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<MarketItem | null>(null);

  const { data: marketData, isLoading, error, refetch } = useMarketItems({
    page: 1,
    pageSize: 24,
    ...filters,
  });
  const items = marketData?.items || [];
  
  const createMutation = useCreateMarketItem();
  const updateMutation = useUpdateMarketItem();
  const deleteMutation = useDeleteMarketItem();

  React.useEffect(() => {
    if (query) {
      setSearchInput(query);
      setFilters((prev) => ({ ...prev, search: query }));
    }
  }, [query]);

  const handleSearch = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput.trim()) {
        await search({ q: searchInput.trim(), type: "market" });
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
      } else {
        setFilters((prev) => ({ ...prev, search: undefined }));
      }
    },
    [searchInput, search]
  );

  const handleCategorySelect = (categorySlug: string | null) => {
    setFilters((prev) => ({
      ...prev,
      category: categorySlug || undefined,
    }));
  };

  const handleCreate = async (data: CreateMarketItemRequest) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: UpdateMarketItemRequest) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data });
      setEditingItem(null);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (deletingItem) {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
      refetch();
    }
  };

  return (
    <div className="px-[44px]">
      {/* Info Banner */}
      <div className=" pt-[52px] flex justify-between items-start">
        <div className="">
          <h2 className="text-[56px] leading-[64px] font-serif text-white/95 mb-2">
            Browse <br /> Marketplace
          </h2>
          <p className="text-base text-white/95 mt-4">
            Discover software, services, content, and more
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#476CFF]/16 rounded-[8px]">
          <InfoIcon />
          <p className="text-xs text-white">
          {address ? "You are connected" : "Browse Mode: Connect your wallet to purchase or create listings."}
          </p>
        </div>
      </div>

      <div className="flex gap-6 min-h-screen mt-[31px]">
        {/* Sidebar */}
        <div className="">
          <MarketSidebar onCategorySelect={handleCategorySelect} scope="market" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search and Filter Bar */}
          <div className=" pb-6 flex items-center justify-between gap-4">
            <form
              onSubmit={handleSearch}
              className="h-10 rounded-[10px] px-3 border  border-[#262626] bg-[#262626]  shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] flex items-center justify-between"
            >
              <div className="flex gap-2 items-center">
                <div className="shrink-0">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-transparent outline-none border-none text-white/95 placeholder:text-[#7b7b7b]"
                  disabled={isLoading}
                />
              </div>
              <div className="w-[31px] h-5 ] rounded-[4px] flex justify-center items-center text-[#7b7b7b]">
                ⌘1
              </div>
            </form>

            <div className="flex items-center gap-4">
              {address && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-10 px-3"
                  icon={<PlusIcon />}
                >
                  Create Listing
                </Button>
              )}
              <button className="h-10 px-2.5 rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[#171717] shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] flex items-center gap-1 text-[#A3A3A3] text-sm hover:opacity-90 transition-opacity">
                <FilterIcon />
                Filter
              </button>

              <div className="flex items-center gap-2 h-[48px] rounded-[10px]  bg-[#262626] p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`h-full w-10 flex justify-center items-center rounded-[6px] transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#171717] text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`h-full w-10 flex justify-center items-center rounded-[6px] transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#171717] text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className=" pb-12">
            {isLoading && items.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loading size="lg" text="Loading market items..." />
              </div>
            ) : error && items.length === 0 ? (
              <ErrorState
                message={error.message || "Failed to load market items"}
                onRetry={() => refetch()}
              />
            ) : items.length === 0 ? (
              <EmptyState
                title="No market items found"
                description="Try adjusting your filters or search query."
              />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-3 gap-4">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="p-2 bg-[#171717] rounded-[16px]">
                      <Image
                        src={product.media?.[0]?.url || "/silk.svg"}
                        alt={product.title}
                        width={346}
                        height={259}
                        className="w-full h-auto object-cover rounded-[12px]"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="px-2 py-4">
                      <div className="w-[258px]">
                        <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-[#A3A3A3] text-xs mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pb-4 border-b border-[#171717]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[#A3A3A3] text-xs mb-1">
                            Price
                          </span>
                          <span className="text-white font-medium text-lg">
                            ${product.price} {product.currency}
                          </span>
                        </div>
                        <h5 className="text-sm text-[#335CFF]">View details</h5>
                      </div>

                      <div className="flex items-start justify-between mb-3 mt-[15px]">
                        <div className="flex flex-col items-start ">
                          <span className=" bg-[#262626] text-[#A3A3A3] text-[11px] uppercase mb-2">
                            {product.category?.title || "UNCATEGORIZED"}
                          </span>
                          <span className="text-[#A3A3A3] text-xs font-mono">
                            {product.seller?.walletAddress?.slice(0, 4)}...{product.seller?.walletAddress?.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40 text-xs">
                          <EyeIcon />
                          <span className="text-white text-sm">
                            {product.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="p-2 bg-[#171717] rounded-[16px] shrink-0">
                        <Image
                          src={product.media?.[0]?.url || "/silk.svg"}
                          alt={product.title}
                          width={346}
                          height={259}
                          className="w-[346px] h-[259px] object-cover rounded-[12px]"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="px-2 py-4 flex-1 flex flex-col">
                        <div className="w-full">
                          <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                            {product.title}
                          </h3>
                          <p className="text-[#A3A3A3] text-xs mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-[#171717]">
                          <div className="flex flex-col gap-1">
                            <span className="text-[#A3A3A3] text-xs mb-1">
                              Price
                            </span>
                            <span className="text-white font-medium text-lg">
                              ${product.price} {product.currency}
                            </span>
                          </div>
                          <h5 className="text-sm text-[#335CFF]">
                            View details
                          </h5>
                        </div>

                        <div className="flex items-start justify-between mb-3 mt-[15px]">
                          <div className="flex flex-col items-start">
                            <span className="bg-[#262626] text-[#A3A3A3] text-[11px] uppercase mb-2">
                              {product.category?.title || "UNCATEGORIZED"}
                            </span>
                            <span className="text-[#A3A3A3] text-xs font-mono">
                              {product.seller?.walletAddress?.slice(0, 4)}...{product.seller?.walletAddress?.slice(-4)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <EyeIcon />
                            <span className="text-white text-sm">
                              {product.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MarketItemModal
        isOpen={isCreateModalOpen || !!editingItem}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={async (data) => {
          if (editingItem) {
            await handleUpdate(data as UpdateMarketItemRequest);
          } else {
            await handleCreate(data as CreateMarketItemRequest);
          }
        }}
        item={editingItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Market Item"
        description="Are you sure you want to delete this market item? This action cannot be undone."
        itemName={deletingItem?.title}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
