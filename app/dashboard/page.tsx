import { AnoymousIcon, PlatformIcon, TokenIcon } from "../components/ui/icons";
import { Button } from "../components/ui/button";

export default function DashboardPage() {
  return (
    <div className="mt-[135px] flex flex-col justify-center items-center">
      <h1 className="text-[72px] text-white/95 font-serif text-center leading-[72px] mb-4">
        Anonymous Digital <br /> Marketplace
      </h1>
      <p className="text-white/95 w-[436px] text-center">
        Peer-to-peer marketplace for private commerce using x402 micropayments
        on Solana. No KYC. No middlemen. Just freedom.
      </p>
      <div className="mt-[64px]">
        <div className="w-[507px] rounded-[20px] bg-[#333] p-1">
          <div className="w-full h-full rounded-[16px] bg-[#262626] px-6 py-5 flex flex-col items-center justify-center">
            <h4 className="text-xl text-white/95 font-medium">
              Connect Your Wallet
            </h4>
            <p className="mt-2 text-sm text-[#A3A3A3] text-center mb-6">
              Connect your Solana wallet to get started. You'll need Phantom
              installed.
            </p>
            <Button>Select Wallet</Button>
          </div>
          <div className="flex gap-4 p-4">
            <div className="h-10 cursor-pointer flex gap-2 px-2.5 items-center bg-[#171717] rounded-[10px] border border-[#262626] shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] ">
              <AnoymousIcon />
              <h5 className="text-sm text-[#A3A3A3] text-nowrap">Anonymous</h5>
            </div>
            <div className="h-10 cursor-pointer flex gap-2 px-2.5 items-center bg-[#171717] rounded-[10px] border border-[#262626] shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] ">
              <PlatformIcon />
              <h5 className="text-sm text-[#A3A3A3] text-nowrap">
                0% Platform Fees
              </h5>
            </div>
            <div className="h-10 cursor-pointer flex gap-2 px-2.5 items-center bg-[#171717] rounded-[10px] border border-[#262626] shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] ">
              <TokenIcon />
              <h5 className="text-sm text-[#A3A3A3] text-nowrap ">
                Token Gated
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
