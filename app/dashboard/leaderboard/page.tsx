"use client";

import { useAccount } from "wagmi";
import {
  InfoIcon,
  SortIcon,
} from "../../components/ui/icons";
import { Loading } from "../../components/ui/loading";
import { EmptyState } from "../../components/ui/empty-state";
import { ErrorState } from "../../components/ui/error-state";
import { useLeaderboard } from "@/app/hooks/use-leaderboard-query";
import * as React from "react";

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [currentScope, setCurrentScope] = React.useState<"market_sales" | "fundraiser_raised" | "top_donors">("market_sales");
  const [currentPeriod, setCurrentPeriod] = React.useState<"daily" | "weekly" | "monthly" | "all_time">("all_time");

  const { data: leaderboard, isLoading, error, refetch } = useLeaderboard({
    scope: currentScope,
    period: currentPeriod,
    limit: 100,
  });

  const handleScopeChange = (scope: "market_sales" | "fundraiser_raised" | "top_donors") => {
    setCurrentScope(scope);
  };

  const handlePeriodChange = (period: "daily" | "weekly" | "monthly" | "all_time") => {
    setCurrentPeriod(period);
  };

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Informational Banner */}
      <div className="flex justify-center items-center pt-[52px]">
        <div className="flex items-center gap-2 px-2 h-8 bg-[#476CFF]/16 rounded-[8px] ">
          <InfoIcon />
          <p className="text-xs text-white">
            {address ? "You are connected" : "Browse Mode: You're viewing the leaderboard. Connect your wallet to create listings and make purchases."}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-[44px] pt-4">
        {/* Title Section */}
        <div className="text-center mb-4">
          <h1 className="text-[56px] font-bold text-white mb-2 leading-[64px]">
            Top Sellers <br /> Leaderboard
          </h1>
          <p className="text-base text-white font-medium">
            The highest earning vendors on SilkRoadx402
          </p>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => handleScopeChange("market_sales")}
            className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
              currentScope === "market_sales"
                ? "bg-[#262626] text-white"
                : "bg-[#171717] text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            Market Sales
          </button>
          <button
            onClick={() => handleScopeChange("fundraiser_raised")}
            className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
              currentScope === "fundraiser_raised"
                ? "bg-[#262626] text-white"
                : "bg-[#171717] text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            Fundraiser Raised
          </button>
          <button
            onClick={() => handleScopeChange("top_donors")}
            className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
              currentScope === "top_donors"
                ? "bg-[#262626] text-white"
                : "bg-[#171717] text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            Top Donors
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => handlePeriodChange("daily")}
            className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
              currentPeriod === "daily"
                ? "bg-[#262626] text-white"
                : "bg-[#171717] text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => handlePeriodChange("weekly")}
            className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
              currentPeriod === "weekly"
                ? "bg-[#262626] text-white"
                : "bg-[#171717] text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => handlePeriodChange("monthly")}
            className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
              currentPeriod === "monthly"
                ? "bg-[#262626] text-white"
                : "bg-[#171717] text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handlePeriodChange("all_time")}
            className={`px-4 py-2 rounded-[10px] text-sm transition-colors ${
              currentPeriod === "all_time"
                ? "bg-[#262626] text-white"
                : "bg-[#171717] text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            All Time
          </button>
        </div>

        {/* Leaderboard Table */}
        {isLoading && !leaderboard ? (
          <div className="flex items-center justify-center py-16">
            <Loading size="lg" text="Loading leaderboard..." />
          </div>
        ) : error && !leaderboard ? (
          <ErrorState
            message={error?.message || "Failed to load leaderboard"}
            onRetry={() => refetch()}
          />
        ) : !leaderboard || leaderboard.entries.length === 0 ? (
          <EmptyState
            title="No leaderboard data"
            description="There are no entries to display for this period."
          />
        ) : (
          <div className="w-full overflow-x-auto flex justify-center mt-[34px]">
            <table className=" border-collapse w-[1104px]">
              <thead>
                <tr className="bg-[#262626] h-9  ">
                  <th className=" px-4 text-left rounded-l-[8px] w-[188px]">
                    <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3] hover:text-white">
                      Rank
                    </button>
                  </th>
                  <th className=" px-4 text-left">
                    <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3] hover:text-white">
                      User
                      <SortIcon />
                    </button>
                  </th>
                  <th className=" px-4 text-left">
                    <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3] hover:text-white">
                      {currentScope === "market_sales"
                        ? "Total Sales"
                        : currentScope === "fundraiser_raised"
                        ? "Total Raised"
                        : "Total Donated"}
                      <SortIcon />
                    </button>
                  </th>
                  <th className=" px-4 text-left">
                    <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3]   hover:text-white">
                      Count
                      <SortIcon />
                    </button>
                  </th>
                  <th className=" px-4 text-left rounded-r-[8px]"></th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.entries.map((entry, index) => (
                  <tr
                    key={entry.userId || index}
                    className="border-b border-[#262626]  transition-colors hover:bg-[#262626]/50"
                  >
                    <td className="text-white/95 text-sm font-medium h-[48px] w-[188px] my-1 px-3 ">
                      #{entry.rank}
                    </td>
                    <td className=" px-3 text-[#A3A3A3] font-medium text-sm h-[48px] my-1 ">
                      {entry.user?.handle || entry.user?.walletAddress?.slice(0, 8) + "..." || "Anonymous"}
                    </td>
                    <td className=" px-3 text-[#A3A3A3] text-sm h-[48px] my-1 ">
                      ${entry.value.toLocaleString()}
                    </td>
                    <td className="px-3 text-sm font-medium h-[48px] my-1 text-white/95">
                      {entry.count || 0}
                    </td>
                    <td className="h-[48px] my-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
