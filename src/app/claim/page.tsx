"use client";

import { motion } from "framer-motion";

import Icon from "@/components/Icons";
import ClaimWidget from "@/components/Widgets/ClaimWidget/ClaimWidget";
import usePersistentStore from "@/stores/persistentStore";
import { BitcoinNetwork } from "@/types/store";

export default function ClaimPage() {
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);

  if (!bitcoinNetwork || bitcoinNetwork !== BitcoinNetwork.Regtest) {
    return (
      <main className="page-content">
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <h1 className="mb-4 text-2xl font-bold">Feature Unavailable</h1>
          <p className="text-gray-600">
            Claim feature is only available on Regtest network.
            <br />
            Please switch to Regtest network to use this feature.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      <motion.div
        className="page__title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Icon name="Claim" />
        <span>Claim</span>
      </motion.div>
      <div className="page-widget lg:!-mt-6">
        <ClaimWidget />
      </div>
    </main>
  );
}
