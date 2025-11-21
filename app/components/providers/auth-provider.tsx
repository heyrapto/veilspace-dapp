"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { useAuthStore } from "@/app/store";
import { Loading } from "../ui/loading";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { authenticate, user, isLoading } = useAuthStore();

  React.useEffect(() => {
    if (address && !user) {
      authenticate(address);
    }
  }, [address, user, authenticate]);

  if (address && !user && isLoading) {
    return <Loading fullScreen text="Authenticating..." />;
  }

  return <>{children}</>;
}

