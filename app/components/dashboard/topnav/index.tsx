"use client";
import { SearchIcon } from "../../ui/icons";
import { Button } from "../../ui/button";
import MenuLink from "./menuLinks/menuLink";
import Link from "next/link";

const TopNavbar = () => {
  const menuItems = [
    {
      title: "Main",
      list: [
        {
          title: "Market",
          path: "/dashboard/market",
        },
        {
          title: "Fundraiser",
          path: "/dashboard/fundraiser",
        },
        {
          title: "Leaderboard",
          path: "/dashboard/leaderboard",
        },
      ],
    },
  ];

  return (
    <div className=" border-b border-[#262626]  h-20 bg-[#171717] px-[44px] ">
      <div className="max-w-[1440px] mx-auto w-full flex justify-between items-center h-full">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="w-10 h-10 bg-[#7D52F4] rounded-full"></Link>
          <nav className=" flex gap-1 ">
            {menuItems
              .find((menu) => menu.title === "Main")
              ?.list.map((item) => (
                <MenuLink item={item} key={item.title} />
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className=" h-10 rounded-[10px] px-3 border  border-[#262626] bg-[#171717]  shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] flex items-center justify-between">
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
            <div className="w-[31px] h-5 bg-[#171717] border border-[#262626] rounded-[4px] flex justify-center items-center text-[#7b7b7b]">
              ⌘1
            </div>
          </div>

          <Button>Create account</Button>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
