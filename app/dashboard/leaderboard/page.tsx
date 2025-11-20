"use client";

import { useAccount } from "wagmi";
import {
  InfoIcon,
  SortIcon,
  TrashIcon,
  EditIcon,
} from "../../components/ui/icons";

interface LeaderboardEntry {
  rank: string;
  date: string;
  product: string;
  client: string;
  amount: string;
}

const leaderboardData: LeaderboardEntry[] = [
  {
    rank: "#4170",
    date: "10/08/2023",
    product: "Notion Monthly Subscription",
    client: "Notion Labs Inc.",
    amount: "-$280.35",
  },
  {
    rank: "#4169",
    date: "09/08/2023",
    product: "Zoom Annual Plan Renewal",
    client: "Zoom Video Communicatio...",
    amount: "-$1,599.00",
  },
  {
    rank: "#4168",
    date: "08/08/2023",
    product: "Marketing Consultation Services",
    client: "Apex Financial",
    amount: "+$2,301.20",
  },
  {
    rank: "#4167",
    date: "07/08/2023",
    product: "Web Development Project Payment",
    client: "Orandis Technology",
    amount: "-$1,245.35",
  },
  {
    rank: "#4166",
    date: "06/08/2023",
    product: "Software License Renewal",
    client: "Solaris Energy",
    amount: "+$254.25",
  },
  {
    rank: "#4165",
    date: "05/08/2023",
    product: "Data Analytics Training Course Fee",
    client: "Horizon Shift Tutoring",
    amount: "-$720.53",
  },
  {
    rank: "#4164",
    date: "04/08/2023",
    product: "Employee Checkup Payments",
    client: "Pulse Healthcare",
    amount: "-$2,123.53",
  },
  {
    rank: "#4163",
    date: "03/08/2023",
    product: "Freelance Writing Services",
    client: "Catalyst Marketing",
    amount: "+$154.42",
  },
  {
    rank: "#4162",
    date: "02/08/2023",
    product: "Project Management Consultancy",
    client: "Aurora Solutions",
    amount: "+$745.21",
  },
];

export default function LeaderboardPage() {
  const { address } = useAccount();
  return (
    <div className="flex flex-col min-h-screen ">
      {/* Informational Banner */}
      <div className="flex justify-center items-center pt-[52px]">
        <div className="flex items-center gap-2 px-2 h-8 bg-[#476CFF]/16 rounded-[8px] ">
          <InfoIcon />
          <p className="text-xs text-white">
            {address ? "" : "Browse Mode: You're viewing the leaderboard. Connect your wallet to create listings and make purchases."}
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

        {/* Leaderboard Table */}
        <div className="w-full overflow-x-auto flex justify-center mt-[34px]">
          <table className=" border-collapse w-[1104px]">
            <thead>
              <tr className="bg-[#262626] h-9  ">
                <th className=" px-4 text-left rounded-l-[8px] w-[188px]">
                  <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3] hover:text-white">
                    Rank
                  </button>
                </th>
                <th className=" px-4 text-left w-[140px]">
                  <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3] hover:text-white">
                    Date
                    <SortIcon />
                  </button>
                </th>
                <th className=" px-4 text-left w-[300px]">
                  <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3] hover:text-white">
                    Product
                    <SortIcon />
                  </button>
                </th>
                <th className=" px-4 text-left">
                  <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3] hover:text-white">
                    Client / Company
                    <SortIcon />
                  </button>
                </th>
                <th className=" px-4 text-left">
                  <button className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3]   hover:text-white">
                    Amount
                    <SortIcon />
                  </button>
                </th>
                <th className=" px-4 text-left rounded-r-[8px]"></th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, index) => (
                <tr
                  key={index}
                  className="border-b border-[#262626]  transition-colors"
                >
                  <td className="flex gap-3 items-center text-white/95 text-sm font-medium h-[48px] w-[188px] my-1 px-3 ">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border border-[#262626] bg-[#171717] appearance-none checked:bg-[#7D52F4] checked:border-[#7D52F4] cursor-pointer"
                    />
                    {entry.rank}
                  </td>
                  <td className=" px-3 text-[#A3A3A3] font-medium text-sm h-[48px] w-[140px] my-1 ">
                    {entry.date}
                  </td>
                  <td className=" px-3 text-[#A3A3A3] text-sm h-[48px] w-[300px] my-1 ">
                    {entry.product}
                  </td>
                  <td className=" px-3 text-[#A3A3A3] h-[48px]  text-sm my-1">
                    {entry.client}
                  </td>
                  <td className="px-3 text-sm font-medium h-[48px] my-1 text-white/95">
                    {entry.amount}
                  </td>
                  <td className="h-[48px] my-1">
                    <div className="flex items-center gap-3">
                      <button className="p-1.5 hover:bg-[#262626] rounded transition-colors ">
                        <TrashIcon />
                      </button>
                      <button className="p-1.5 hover:bg-[#262626] rounded transition-colors">
                        <EditIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
