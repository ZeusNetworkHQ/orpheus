"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import usePersistentStore from "@/stores/persistentStore";
import { SolanaRpcProvider } from "@/types/store";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const solanaRpcProvider = usePersistentStore(
    (state) => state.solanaRpcProvider
  );
  const networkConfig = useNetworkConfig();

  const endpoint = useMemo(
    () =>
      solanaRpcProvider === SolanaRpcProvider.Zeus
        ? networkConfig.solanaUrl
        : networkConfig.customSolanaUrl,
    [networkConfig, solanaRpcProvider]
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
