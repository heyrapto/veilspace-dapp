"use client";

import * as React from "react";
// import { useRouter } from "next/navigation";
import { useSearchStore } from "@/app/store";
import { Loading } from "../../components/ui/loading";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorState } from "../../components/ui/error-state";
import Image from "next/image";
import { EyeIcon } from "../../components/ui/icons";
import Link from "next/link";

export default function SearchPage() {
  // const router = useRouter();
  const { results, isLoading, error, search: performSearch } = useSearchStore();
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<"all" | "market" | "fundraiser">("all");

  React.useEffect(() => {
    // Get query from URL on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("q") || "";
      const urlType = (params.get("type") as "all" | "market" | "fundraiser") || "all";
      setQuery(urlQuery);
      setType(urlType);
      
      if (urlQuery) {
        performSearch({ q: urlQuery, type: urlType });
      }
    }
  }, [performSearch]);

  const marketItems = results?.market || [];
  const fundraisers = results?.fundraisers || [];
  const totalResults = (results?.total || 0);

  return (
    <div className="px-[44px] py-[52px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[56px] leading-[64px] font-serif text-white/95 mb-2">
            Search Results
          </h1>
          <p className="text-base text-white/95">
            {query ? `Results for "${query}"` : "Enter a search query"}
          </p>
          {query && (
            <p className="text-[#A3A3A3] text-sm mt-2">
              {totalResults} {totalResults === 1 ? "result" : "results"} found
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loading size="lg" text="Searching..." />
          </div>
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => query && performSearch({ q: query, type })}
          />
        ) : !query ? (
          <EmptyState
            title="No search query"
            description="Enter a search term to find market items and fundraisers."
          />
        ) : totalResults === 0 ? (
          <EmptyState
            title="No results found"
            description={`No results found for "${query}". Try different keywords.`}
          />
        ) : (
          <div className="space-y-12">
            {/* Market Items */}
            {(type === "all" || type === "market") && marketItems.length > 0 && (
              <div>
                <h2 className="text-white/95 text-2xl font-medium mb-6">
                  Market Items ({marketItems.length})
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {marketItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/market?item=${item.id}`}
                      className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors cursor-pointer"
                    >
                      <div className="p-2 bg-[#171717] rounded-[16px]">
                        <Image
                          src={item.media?.[0]?.url || "/silk.svg"}
                          alt={item.title}
                          width={346}
                          height={259}
                          className="w-full h-auto object-cover rounded-[12px]"
                        />
                      </div>
                      <div className="px-2 py-4">
                        <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[#A3A3A3] text-xs mb-4 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between pb-4 border-b border-[#171717]">
                          <div className="flex flex-col gap-1">
                            <span className="text-[#A3A3A3] text-xs">Price</span>
                            <span className="text-white font-medium text-lg">
                              ${item.price} {item.currency}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-white/40 text-xs mt-3">
                          <EyeIcon />
                          <span className="text-white text-sm">{item.views}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Fundraisers */}
            {(type === "all" || type === "fundraiser") && fundraisers.length > 0 && (
              <div>
                <h2 className="text-white/95 text-2xl font-medium mb-6">
                  Fundraisers ({fundraisers.length})
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {fundraisers.map((fundraiser) => {
                    const raised = fundraiser.totalRaised || fundraiser.raised || 0;
                    const progress = Math.min((raised / fundraiser.goal) * 100, 100);
                    return (
                      <Link
                        key={fundraiser.id}
                        href={`/dashboard/fundraiser?fundraiser=${fundraiser.id}`}
                        className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors cursor-pointer"
                      >
                        <div className="p-2 bg-[#171717] rounded-[16px]">
                          <Image
                            src={fundraiser.media?.[0]?.url || "/silk.svg"}
                            alt={fundraiser.title}
                            width={346}
                            height={259}
                            className="w-full h-auto object-cover rounded-[12px]"
                          />
                        </div>
                        <div className="px-2 py-4">
                          <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                            {fundraiser.title}
                          </h3>
                          <p className="text-[#A3A3A3] text-xs mb-4 line-clamp-2">
                            {fundraiser.summary || fundraiser.description}
                          </p>
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[#A3A3A3] text-xs">Progress</span>
                              <span className="text-white/95 text-xs">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#335CFF] transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-white/95 text-sm font-medium">
                                ${raised.toLocaleString()}
                              </span>
                              <span className="text-[#A3A3A3] text-xs">
                                of ${fundraiser.goal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <EyeIcon />
                            <span className="text-white text-sm">{fundraiser.views}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

