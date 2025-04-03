"use client";
import { motion } from "framer-motion";

import PortfolioTransactions from "@/components/PortfolioV2/Transactions/PortfolioTransactions";

export default function PortfolioTransactionsPage() {
  return (
    <main className="page-content ds">
      <motion.div
        className="text-sys-color-text-primary px-apollo-10 mt-32 text-4xl md:mt-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <b>
          <h1>Transactions</h1>
        </b>
      </motion.div>
      <PortfolioTransactions />
    </main>
  );
}
