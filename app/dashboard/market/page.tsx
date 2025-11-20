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
} from "../../components/ui/icons";
import Image from "next/image";
import { useAccount } from "wagmi";

interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
  tag: string;
  identifier: string;
  views: number;
}

const products: Product[] = [
  {
    id: "1",
    image: "/mask.avif",
    title: "SRx402 Early Adopter Certification VFT",
    description:
      "SilkRoad x402 - Very Fungible Token The Very Fungible Token is not a currency—it's a relic. Each certificate is",
    price: "$10.00 USDC",
    tag: "CUSTOM",
    identifier: "FgPY...tjuw",
    views: 120,
  },
  {
    id: "2",
    image: "/mask.avif",
    title: "SRx402 Early Adopter Certification VFT",
    description:
      "SilkRoad x402 - Very Fungible Token The Very Fungible Token is not a currency—it's a relic. Each certificate is",
    price: "$10.00 USDC",
    tag: "CUSTOM",
    identifier: "FgPY...tjuw",
    views: 120,
  },
  {
    id: "3",
    image: "/mask.avif",
    title: "SRx402 Early Adopter Certification VFT",
    description:
      "SilkRoad x402 - Very Fungible Token The Very Fungible Token is not a currency—it's a relic. Each certificate is",
    price: "$10.00 USDC",
    tag: "CUSTOM",
    identifier: "FgPY...tjuw",
    views: 120,
  },
];

export default function MarketPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const { address } = useAccount();

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
          {address ? "Browse Mode: Connect your wallet to purchase or create listings." : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-6 min-h-screen mt-[31px]">
        {/* Sidebar */}
        <div className="">
          <MarketSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search and Filter Bar */}
          <div className=" pb-6 flex items-center justify-between gap-4">
            <div className=" h-10 rounded-[10px] px-3 border  border-[#262626] bg-[#262626]  shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="shrink-0">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none border-none"
                />
              </div>
              <div className="w-[31px] h-5 ] rounded-[4px] flex justify-center items-center text-[#7b7b7b]">
                ⌘1
              </div>
            </div>

            <div className="flex items-center gap-4">
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
            {viewMode === "grid" ? (
              <div className="grid grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors"
                  >
                    {/* Product Image */}
                    <div className="p-2 bg-[#171717] rounded-[16px]">
                      <Image
                        src="/silk.svg"
                        alt={product.title}
                        width={346}
                        height={259}
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
                            {product.price}
                          </span>
                        </div>
                        <h5 className="text-sm text-[#335CFF]">View details</h5>
                      </div>

                      <div className="flex items-start justify-between mb-3 mt-[15px]">
                        <div className="flex flex-col items-start ">
                          <span className=" bg-[#262626] text-[#A3A3A3] text-[11px] uppercase mb-2">
                            {product.tag}
                          </span>
                          <span className="text-[#A3A3A3] text-xs font-mono">
                            {product.identifier}
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
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#262626] p-1 rounded-[20px] border border-[#262626] overflow-hidden hover:border-[#333] transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="p-2 bg-[#171717] rounded-[16px] shrink-0">
                        <Image
                          src="/silk.svg"
                          alt={product.title}
                          width={346}
                          height={259}
                          className="w-[346px] h-[259px] object-cover"
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
                              {product.price}
                            </span>
                          </div>
                          <h5 className="text-sm text-[#335CFF]">
                            View details
                          </h5>
                        </div>

                        <div className="flex items-start justify-between mb-3 mt-[15px]">
                          <div className="flex flex-col items-start">
                            <span className="bg-[#262626] text-[#A3A3A3] text-[11px] uppercase mb-2">
                              {product.tag}
                            </span>
                            <span className="text-[#A3A3A3] text-xs font-mono">
                              {product.identifier}
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
    </div>
  );
}
