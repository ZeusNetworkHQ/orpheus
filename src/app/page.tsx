"use client";

import { motion } from "framer-motion";

import Provide from "../components/Icons/icons/Provide";
import MintWidget from "../components/Widgets/MintWidget/MintWidget";

export default function Home() {
  return (
    <main className="page-content">
      <motion.div
        className="page__title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Provide />
        <span>Mint</span>
      </motion.div>
      <div className="page-widget lg:!-mt-6">
        <MintWidget />
      </div>
    </main>
  );
}
