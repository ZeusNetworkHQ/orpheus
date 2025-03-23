import { useWallet } from "@solana/wallet-adapter-react";

import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import usePersistentStore from "@/stores/persistentStore";
import { BitcoinNetwork } from "@/types/store";
import { cn } from "@/utils/misc";

import styles from "../styles.module.scss";

export default function CardActionsHeader() {
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const { connected: bitcoinWalletConnected } = useBitcoinWallet();
  const { connected: solanaWalletConnected } = useWallet();

  const isAllConnected = solanaWalletConnected && bitcoinWalletConnected;

  if (bitcoinNetwork === BitcoinNetwork.Testnet && isAllConnected) {
    return (
      <div className={cn(styles.claimWidget__card__actions__title, "pb-6")}>
        Bitcoin Testnet Faucet
      </div>
    );
  }

  return (
    <div className={cn(styles.claimWidget__card__actions__title, "pb-11")}>
      Claim your free tBTC
    </div>
  );
}
