import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { Suspense, useState } from "react";

import PortfolioTransactionsTables from "./PortfolioTransactionsTables";
import PortfolioTransactionsTabs from "./PortfolioTransactionsTabs";

export default function PortfolioTransactions() {
  const { publicKey: solanaPubkey } = useWallet();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col gap-y-40 pt-8"
    >
      <PortfolioTransactionsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Suspense>
        <PortfolioTransactionsTables
          activeTab={activeTab}
          solanaPubkey={solanaPubkey}
        />
      </Suspense>
    </motion.div>
  );
}
