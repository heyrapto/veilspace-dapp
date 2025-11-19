"use client";

import * as React from "react";
import {
  AllListingsIcon,
  RobotIcon,
  WrenchIcon,
  DocumentIcon,
  BriefcaseIcon,
  MusicIcon,
  GamepadIcon,
  PuzzleIcon,
  LockIcon,
  PhoneIcon,
  MegaphoneIcon,
  PaperPlaneIcon,
  ChatIcon,
  PaletteIcon,
  PlayIcon,
} from "../ui/icons";

interface Category {
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { name: "All listings", icon: <AllListingsIcon /> },
  { name: "Trading bots", icon: <RobotIcon /> },
  { name: "API tools", icon: <WrenchIcon /> },
  { name: "Scripts", icon: <DocumentIcon /> },
  { name: "Job search", icon: <BriefcaseIcon /> },
  { name: "Music", icon: <MusicIcon /> },
  { name: "Games", icon: <GamepadIcon /> },
  { name: "Mods", icon: <PuzzleIcon /> },
  { name: "Private access", icon: <LockIcon /> },
  { name: "Call groups", icon: <PhoneIcon /> },
  { name: "Raid services", icon: <MegaphoneIcon /> },
  { name: "Telegram groups", icon: <PaperPlaneIcon /> },
  { name: "Discord services", icon: <ChatIcon /> },
  { name: "Art & design", icon: <PaletteIcon /> },
  { name: "Video content", icon: <PlayIcon /> },
];

export default function MarketSidebar() {
  const [selectedCategory, setSelectedCategory] =
    React.useState("All listings");

  return (
    <div className="w-[258px] p-2.5 rounded-[16px] border border-[#262626] bg-[#171717] shadow-[0_1px_2px_rgba(10,13,20,0.03)]">
      <nav className="flex flex-col gap-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-sm transition-colors cursor-pointer ${
              selectedCategory === category.name
                ? "bg-[#262626] text-white"
                : "text-white/60 hover:text-white hover:bg-[#262626]"
            }`}
          >
            {category.icon && <span className="shrink-0">{category.icon}</span>}
            <span>{category.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
