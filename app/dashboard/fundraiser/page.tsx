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
import { useFundraisers, useCreateFundraiser, useUpdateFundraiser, useDeleteFundraiser } from "@/app/hooks/use-fundraiser-query";
import { FundraiserModal } from "../../components/modals/fundraiser-modal";
import { DeleteModal } from "../../components/ui/delete-modal";
import { Button } from "../../components/ui/button";
import { Fundraiser, CreateFundraiserRequest, UpdateFundraiserRequest } from "@/app/services.tsx/api-client";

export default function FundraiserPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const { address } = useAccount();
  const { query, search } = useSearchStore();
  const [searchInput, setSearchInput] = React.useState("");
  const [filters, setFilters] = React.useState({
    category: undefined as string | undefined,
    sort: "trending" as "trending" | "ending_soon" | "raised" | "new",
    search: undefined as string | undefined,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingFundraiser, setEditingFundraiser] = React.useState<Fundraiser | null>(null);
  const [deletingFundraiser, setDeletingFundraiser] = React.useState<Fundraiser | null>(null);

  const { data: fundraiserData, isLoading, error, refetch } = useFundraisers({
    page: 1,
    pageSize: 24,
    ...filters,
  });
  const fundraisers = fundraiserData?.items || [];
  
  const createMutation = useCreateFundraiser();
  const updateMutation = useUpdateFundraiser();
  const deleteMutation = useDeleteFundraiser();

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
        await search({ q: searchInput.trim(), type: "fundraiser" });
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

  const handleCreate = async (data: CreateFundraiserRequest) => {
    await createMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: UpdateFundraiserRequest) => {
    if (editingFundraiser) {
      await updateMutation.mutateAsync({ id: editingFundraiser.id, data });
      setEditingFundraiser(null);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (deletingFundraiser) {
      await deleteMutation.mutateAsync(deletingFundraiser.id);
      setDeletingFundraiser(null);
      refetch();
    }
  };

  return (
    <div className="px-[44px]">
      {/* Info Banner */}
      <div className=" pt-[52px] flex justify-between items-start">
        <div className="">
          <h2 className="text-[56px] leading-[64px] font-serif text-white/95 mb-2">
            Browse <br /> Fundraisers
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
          <MarketSidebar onCategorySelect={handleCategorySelect} scope="fundraiser" />
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
                  Create Fundraiser
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

          {/* Fundraiser Grid */}
          <div className=" pb-12">
            {isLoading && fundraisers.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loading size="lg" text="Loading fundraisers..." />
              </div>
            ) : error && fundraisers.length === 0 ? (
              <ErrorState
                message={error.message || "Failed to load fundraisers"}
                onRetry={() => refetch()}
              />
            ) : fundraisers.length === 0 ? (
              <EmptyState
                title="No fundraisers found"
                description="Try adjusting your filters or search query."
              />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-3 gap-4">
                {fundraisers.map((fundraiser) => (
                  <div
                    key={fundraiser.id}
                    className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors cursor-pointer"
                  >
                    {/* Fundraiser Image */}
                    <div className="p-2 bg-[#171717] rounded-[16px]">
                      <Image
                        src={fundraiser.media?.[0]?.url || "/silk.svg"}
                        alt={fundraiser.title}
                        width={346}
                        height={259}
                        className="w-full h-auto object-cover rounded-[12px]"
                      />
                    </div>

                    {/* Fundraiser Info */}
                    <div className="px-2 py-4">
                      <div className="w-[258px]">
                        <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                          {fundraiser.title}
                        </h3>
                        <p className="text-[#A3A3A3] text-xs mb-4 line-clamp-2">
                          {fundraiser.summary || fundraiser.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pb-4 border-b border-[#171717]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[#A3A3A3] text-xs mb-1">
                            Raised
                          </span>
                          <span className="text-white font-medium text-lg">
                            ${fundraiser.raised.toLocaleString()} / ${fundraiser.goal.toLocaleString()}
                          </span>
                        </div>
                        <h5 className="text-sm text-[#335CFF]">View details</h5>
                      </div>

                      <div className="flex items-start justify-between mb-3 mt-[15px]">
                        <div className="flex flex-col items-start ">
                          <span className=" bg-[#262626] text-[#A3A3A3] text-[11px] uppercase mb-2">
                            {fundraiser.category?.title || "UNCATEGORIZED"}
                          </span>
                          <span className="text-[#A3A3A3] text-xs font-mono">
                            {fundraiser.owner?.walletAddress?.slice(0, 4)}...{fundraiser.owner?.walletAddress?.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40 text-xs">
                          <EyeIcon />
                          <span className="text-white text-sm">
                            {fundraiser.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {fundraisers.map((fundraiser) => (
                  <div
                    key={fundraiser.id}
                    className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Fundraiser Image */}
                      <div className="p-2 bg-[#171717] rounded-[16px] shrink-0">
                        <Image
                          src={fundraiser.media?.[0]?.url || "/silk.svg"}
                          alt={fundraiser.title}
                          width={346}
                          height={259}
                          className="w-[346px] h-[259px] object-cover rounded-[12px]"
                        />
                      </div>

                      {/* Fundraiser Info */}
                      <div className="px-2 py-4 flex-1 flex flex-col">
                        <div className="w-full">
                          <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                            {fundraiser.title}
                          </h3>
                          <p className="text-[#A3A3A3] text-xs mb-4 line-clamp-2">
                            {fundraiser.summary || fundraiser.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-[#171717]">
                          <div className="flex flex-col gap-1">
                            <span className="text-[#A3A3A3] text-xs mb-1">
                              Raised
                            </span>
                            <span className="text-white font-medium text-lg">
                              ${fundraiser.raised.toLocaleString()} / ${fundraiser.goal.toLocaleString()}
                            </span>
                          </div>
                          <h5 className="text-sm text-[#335CFF]">
                            View details
                          </h5>
                        </div>

                        <div className="flex items-start justify-between mb-3 mt-[15px]">
                          <div className="flex flex-col items-start">
                            <span className="bg-[#262626] text-[#A3A3A3] text-[11px] uppercase mb-2">
                              {fundraiser.category?.title || "UNCATEGORIZED"}
                            </span>
                            <span className="text-[#A3A3A3] text-xs font-mono">
                              {fundraiser.owner?.walletAddress?.slice(0, 4)}...{fundraiser.owner?.walletAddress?.slice(-4)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <EyeIcon />
                            <span className="text-white text-sm">
                              {fundraiser.views}
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
      <FundraiserModal
        isOpen={isCreateModalOpen || !!editingFundraiser}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingFundraiser(null);
        }}
        onSubmit={async (data) => {
          if (editingFundraiser) {
            await handleUpdate(data as UpdateFundraiserRequest);
          } else {
            await handleCreate(data as CreateFundraiserRequest);
          }
        }}
        fundraiser={editingFundraiser}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteModal
        isOpen={!!deletingFundraiser}
        onClose={() => setDeletingFundraiser(null)}
        onConfirm={handleDelete}
        title="Delete Fundraiser"
        description="Are you sure you want to delete this fundraiser? This action cannot be undone."
        itemName={deletingFundraiser?.title}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
