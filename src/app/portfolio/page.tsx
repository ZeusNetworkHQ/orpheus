"use client";

import { motion } from "framer-motion";

import PortfolioOverview from "@/components/PortfolioV2/Overview/PortfolioOverview";

export default function PortfolioPage() {
  return (
    <main className="page-content ds">
      <motion.div
        className="text-sys-color-text-primary px-apollo-40 mt-32 text-4xl md:mt-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2>
          <b>Overview</b>
        </h2>
      </motion.div>
      <PortfolioOverview />
    </main>
  );
}
