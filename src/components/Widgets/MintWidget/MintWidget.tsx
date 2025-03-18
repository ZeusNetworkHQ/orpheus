"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import useBalance from "@/hooks/useBalance";
import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import useDepositTransactionsWithCache from "@/hooks/useDepositTransactionsWithCache";
import usePositions from "@/hooks/usePositions";
import usePrice from "@/hooks/usePrice";
import useTransactions from "@/hooks/useTransactions";
import { InteractionStatus, InteractionType } from "@/types/api";

import Tabs from "../Tabs/Tabs";

import Deposit from "./Deposit";
import InteractionsList from "./InteractionsList";
import styles from "./styles.module.scss";
import Withdraw from "./Withdraw";

const tabs = [
  {
    label: "Deposit",
    value: "deposit",
  },
  {
    label: "Withdraw",
    value: "withdraw",
  },
];

export default function MintWidget() {
  const searchParams = useSearchParams();
  const widgetRef = useRef<HTMLDivElement>(null);
  const { price: btcPrice } = usePrice("BTCUSDC");
  const { publicKey: solanaPubkey } = useWallet();
  const {
    wallet: bitcoinWallet,
    connected: bitcoinWalletConnected,
    signPsbt,
  } = useBitcoinWallet();
  const { connected: solanaWalletConnected } = useWallet();
  const { cachedUtxos, mutate: mutateDepositTransactions } =
    useDepositTransactionsWithCache({
      solanaAddress: solanaPubkey?.toBase58(),
      bitcoinXOnlyPubkey: bitcoinWallet
        ? toXOnly(Buffer.from(bitcoinWallet.pubkey, "hex")).toString("hex")
        : undefined,
    });
  const { mutate: mutateWithdrawalTransactions } = useTransactions(
    {
      solanaAddress: solanaPubkey?.toBase58(),
      types: [InteractionType.Withdrawal],
      statuses: [
        InteractionStatus.AddWithdrawalRequest,
        InteractionStatus.AddUnlockToUserProposal,
        InteractionStatus.BitcoinUnlockToUser,
        InteractionStatus.VerifyUnlockToUserTransaction,
        InteractionStatus.SolanaUnlockToUser,
      ],
    },
    20
  );
  const {
    data: zbtcBalance,
    mutate: mutateZbtcBalance,
    isLoading: isLoadingZbtcBalance,
  } = useBalance(solanaPubkey);
  const {
    data: positions,
    mutate: mutatePositions,
    isLoading: isLoadingPositions,
  } = usePositions(solanaPubkey);

  const [activeTab, setActiveTab] = useState(Number(searchParams.get("tab")));

  const isAllConnected = solanaWalletConnected && bitcoinWalletConnected;

  const handleTabClick = (tabValue: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.value === tabValue);
    setActiveTab(tabIndex);
  };

  return (
    <div className={styles.mint}>
      <div className={styles.mint__grid}>
        <InteractionsList />
        <div
          className={`${styles.mintWidget} !scroll-mt-[50px] md:!scroll-mt-[100px]`}
          ref={widgetRef}
        >
          <Tabs
            layoutId="provide"
            tabs={tabs}
            activeTab={activeTab}
            onClick={handleTabClick}
          />
          <div className={`${styles.mintWidget__card} mask-border`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={activeTab}
              className={`${styles.mintWidget__card__content} relative`}
            >
              {activeTab === 0 && (
                <Deposit
                  solanaPubkey={solanaPubkey}
                  bitcoinWallet={bitcoinWallet}
                  isAllConnected={isAllConnected}
                  signPsbt={signPsbt}
                  updateDepositTransactions={async () => {
                    await mutateDepositTransactions();
                  }}
                  btcPrice={btcPrice}
                  cachedUtxos={cachedUtxos}
                  switchToWithdrawTab={() => {
                    handleTabClick("withdraw");
                  }}
                />
              )}
              {activeTab === 1 &&
                !isLoadingPositions &&
                !isLoadingZbtcBalance && (
                  <Withdraw
                    solanaPubkey={solanaPubkey}
                    solanaWalletConnected={solanaWalletConnected}
                    positions={positions}
                    btcPrice={btcPrice}
                    zbtcBalance={zbtcBalance}
                    updateTransactions={async () => {
                      await mutateWithdrawalTransactions();
                    }}
                    updateZbtcBalance={async () => {
                      await mutatePositions();
                      await mutateZbtcBalance();
                    }}
                  />
                )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
