"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { satoshiToBtc } from "@/bitcoin";
import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import { useFetchers } from "@/hooks/misc/useFetchers";
import usePersistentStore from "@/stores/persistentStore";
import useStore from "@/stores/store";
import { claimTBTCSchema } from "@/types/api";
import { createAxiosInstances } from "@/utils/axios";
import { MODAL_NAMES } from "@/utils/constant";
import { notifyError } from "@/utils/notification";

import SuccessfulClaim from "../../SuccessfulClaim/SuccessfulClaim";

import styles from "./styles.module.scss";
import CardActionsFooter from "./SubComponents/CardActionsFooter";
import CardActionsHeader from "./SubComponents/CardActionsHeader";
import CardAlertList from "./SubComponents/CardAlertList";

const CLAIM_AMOUNT_LIMIT = 5000000; // satoshis

export default function ClaimWidget() {
  const { solanaNetwork, bitcoinNetwork } = usePersistentStore();
  const [claimableTimes, setClaimableTimes] = useState(5);
  const [isClaiming, setIsClaiming] = useState(false);
  const { wallet: bitcoinWallet, connected: bitcoinWalletConnected } =
    useBitcoinWallet();
  const { connected: solanaWalletConnected } = useWallet();
  const { aegleFetcher } = useFetchers();
  const openModalByName = useStore((state) => state.openModalByName);

  useEffect(() => {
    if (!bitcoinWallet) return;
    const fetchClaimableAmount = async () => {
      try {
        const response = await aegleFetcher(
          `api/v1/bitcoin-regtest-wallet/${bitcoinWallet.p2tr}`,
          claimTBTCSchema
        );
        if (!response) return;

        setClaimableTimes(response.remainingClaimCounts);
      } catch (error) {
        console.error("Error fetching claimable amount:", error);
      }
    };
    fetchClaimableAmount();
  }, [bitcoinWallet, aegleFetcher]);

  const handleClaim = () => {
    if (!bitcoinWallet) return;

    setIsClaiming(true);

    const { aegleApi } = createAxiosInstances(solanaNetwork, bitcoinNetwork);

    const claimUrl = `api/v1/bitcoin-regtest-wallet/${bitcoinWallet.p2tr}/claim`;

    aegleApi
      .post(claimUrl, {
        amount: CLAIM_AMOUNT_LIMIT,
      })
      .then((response) => {
        if (response.status === 200) {
          openModalByName(MODAL_NAMES.SUCCESSFUL_CLAIM);
        } else if (response.status === 429) {
          notifyError("You have reached the daily claim limit.");
        }
      })
      .catch((error) => {
        console.error("Claim error:", error);
        notifyError("Claim failed. Please try again later.");
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  return (
    <div className={styles.claimWidget}>
      <div className={`${styles.claimWidget__card} mask-border`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles.claimWidget__card__content}
        >
          <div className={styles.claimWidget__card__alert}>
            <CardActionsHeader />
            <CardAlertList />
          </div>
          <CardActionsFooter
            claimableTimes={claimableTimes}
            claimedProgress={(claimableTimes / 5) * 100}
            handleClaim={handleClaim}
            isClaiming={isClaiming}
            isAllConnected={solanaWalletConnected && bitcoinWalletConnected}
          />
        </motion.div>
      </div>
      <SuccessfulClaim claimedAmount={satoshiToBtc(CLAIM_AMOUNT_LIMIT)} />
    </div>
  );
}
