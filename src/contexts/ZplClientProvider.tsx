"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createContext, useContext, useMemo } from "react";

import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import { ZplClient } from "@/zplClient";

const ZplClientContext = createContext<ZplClient | null>(null);

export const ZplClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { connection } = useConnection();
  const networkConfig = useNetworkConfig();
  const { publicKey: walletPublicKey, signTransaction } = useWallet();

  const twoWayPegProgramId = networkConfig.twoWayPegProgramId;
  const liquidityManagementProgramId =
    networkConfig.liquidityManagementProgramId;
  const assetMint = networkConfig.assetMint;

  const client = useMemo(() => {
    return new ZplClient(
      connection,
      walletPublicKey,
      signTransaction,
      twoWayPegProgramId,
      liquidityManagementProgramId,
      assetMint
    );
  }, [
    connection,
    walletPublicKey,
    twoWayPegProgramId,
    liquidityManagementProgramId,
    assetMint,
    signTransaction,
  ]);

  return (
    <ZplClientContext.Provider value={client}>
      {children}
    </ZplClientContext.Provider>
  );
};

export const useZplClient = (): ZplClient | null => {
  const context = useContext(ZplClientContext);
  if (context === undefined) {
    throw new Error("useZplClient must be used within a ZplClientProvider");
  }
  return context;
};
