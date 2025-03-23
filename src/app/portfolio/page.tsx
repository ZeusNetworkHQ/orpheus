"use client";

import { motion } from "framer-motion";

import PortfolioOverview from "@/components/PortfolioV2/Overview/PortfolioOverview";

export default function PortfolioPage() {
  return (
    <main className="page-content ds">
      <motion.div
        className="headline-headline3 text-sys-color-text-primary px-apollo-10 mt-32 md:mt-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span>Overview</span>
      </motion.div>
      <PortfolioOverview />
    </main>
  );
}
