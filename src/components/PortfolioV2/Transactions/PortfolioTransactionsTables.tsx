import { PublicKey } from "@solana/web3.js";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import Tabs from "@/components/Tabs/Tabs";

import PortfolioTransactionsDeposits from "./PortfolioTransactionsDeposits";
import PortfolioTransactionsHistorical from "./PortfolioTransactionsHistorical";
import PortfolioTransactionsWithdrawals from "./PortfolioTransactionsWithdrawals";

const PortfolioTransactionsTypeTab = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}) => {
  return (
    <Tabs
      setActiveTab={setActiveTab}
      activeTab={activeTab}
      type="segmented"
      layoutName="PortfolioTransactionsType"
      tabs={[
        {
          label: "Deposits",
        },
        {
          label: "Withdrawals",
        },
      ]}
    />
  );
};

const PortfolioTransactionsTables = ({
  activeTab,
  solanaPubkey,
}: {
  activeTab: number;
  solanaPubkey: PublicKey | null;
}) => {
  const transactionsTypeTab = useSearchParams().get("type");
  const [activeTransactionTypeTab, setActiveTransactionTypeTab] = useState(
    Number(transactionsTypeTab) ?? 0
  );

  return activeTab === 0 ? (
    <div>
      <PortfolioTransactionsTypeTab
        activeTab={activeTransactionTypeTab}
        setActiveTab={setActiveTransactionTypeTab}
      />
      {activeTransactionTypeTab === 0 ? (
        <motion.div
          className="h-full w-full"
          key={activeTransactionTypeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <PortfolioTransactionsDeposits solanaPubkey={solanaPubkey} />
        </motion.div>
      ) : (
        <motion.div
          key={activeTransactionTypeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <PortfolioTransactionsWithdrawals solanaPubkey={solanaPubkey} />
        </motion.div>
      )}
    </div>
  ) : (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <PortfolioTransactionsHistorical solanaPubkey={solanaPubkey} />
    </motion.div>
  );
};

export default PortfolioTransactionsTables;
