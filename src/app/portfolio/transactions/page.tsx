"use client";
import { motion } from "framer-motion";

import PortfolioTransactions from "@/new-components/PortfolioV2/Transactions/PortfolioTransactions";

export default function PortfolioTransactionsPage() {
  return (
    <main className="page-content ds">
      <motion.div
        className="headline-headline3 text-sys-color-text-primary px-apollo-10 mt-32 md:mt-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span>Transactions</span>
      </motion.div>
      <PortfolioTransactions />
    </main>
  );
}
