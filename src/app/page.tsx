"use client";

import { motion } from "framer-motion";

import Icon from "@/components/Icons";

import MintWidget from "../components/Widgets/MintWidget/MintWidget";

export default function Home() {
  return (
    <main className="page-content">
      <motion.div
        className="page__title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Icon name="Provide" />
        <span>Mint</span>
      </motion.div>
      <div className="page-widget lg:!-mt-6">
        <MintWidget />
      </div>
    </main>
  );
}
