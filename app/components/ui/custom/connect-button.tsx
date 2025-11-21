"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../button";
import Image from "next/image";

const CustomConnectButton = ({
  onclick,
}: {
  onclick?: () => void;
  onBalanceChange?: (balance: number) => void;
}) => {

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    className="w-full"
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button
                    className="w-full cursor-not-allowed"
                    onClick={openChainModal}
                  >
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className="flex items-center gap-2 w-full">
                  {!onclick && (
                    <Button
                      onClick={openAccountModal}
                      className="w-full"
                    >
                      {/* {chain.iconUrl && (
                        <Image
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          className="h-full"
                          width={25}
                          height={25}
                        />
                      )} */}
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomConnectButton;
