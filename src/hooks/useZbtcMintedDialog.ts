import { useWallet } from "@solana/wallet-adapter-react";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";

import usePersistentStore from "@/stores/persistentStore";
import {
  zbtcMintedDialogSchema,
  Interaction,
  InteractionStatus,
  InteractionType,
} from "@/types/api";
import { createAxiosInstances } from "@/utils/axios";

import { useFetchers } from "./useFetchers";
import useTransactions from "./useTransactions";

function useZbtcMintedDialog() {
  const { solanaNetwork, bitcoinNetwork } = usePersistentStore();
  const { publicKey: solanaPubkey } = useWallet();
  const solanaAddress = solanaPubkey?.toBase58();

  const { aegleFetcher } = useFetchers();

  const { data: transactions } = useTransactions(
    {
      solanaAddress: solanaAddress,
      types: [InteractionType.Deposit],
      statuses: [InteractionStatus.Peg],
    },
    10 // hardcoded limit might be a problem if user got a lot of deposits
  );

  const [totalAmount, setTotalAmount] = useState<BigNumber>(new BigNumber(0));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (transactions.length < 1 || !solanaAddress) return;

    const fetchLastDialogTimestamp = async (
      transactions: Interaction[],
      solanaAddress: string
    ) => {
      // GET v1/zbtc/:solanaAddress/dialog
      // response: ZbtcMintedDialog
      const result = await aegleFetcher(
        `api/v1/zbtc/${solanaAddress}/dialog`,
        zbtcMintedDialogSchema
      );

      const latestTransaction = transactions.find(
        (tx) =>
          tx.current_step_at && tx.current_step_at > result.lastReceivedTime
      );

      if (latestTransaction) {
        const totalAmount = transactions.reduce((acc, tx) => {
          if (
            tx.current_step_at &&
            tx.current_step_at > result.lastReceivedTime
          ) {
            return acc
              .plus(tx.amount)
              .minus(new BigNumber(tx.miner_fee))
              .minus(new BigNumber(tx.service_fee));
          }
          return acc;
        }, new BigNumber(0));

        setIsOpen(true);
        setTotalAmount(totalAmount);

        // POST v1/zbtc/:solanaAddress/dialog
        // body: ZbtcMintedDialog
        const { aegleApi } = createAxiosInstances(
          solanaNetwork,
          bitcoinNetwork
        );
        const res = await aegleApi.post(
          `api/v1/zbtc/${solanaAddress}/dialog`,
          {
            lastReceivedTime: latestTransaction.current_step_at,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status !== 200) {
          console.error("Failed to update last received time");
        }
      }
    };

    fetchLastDialogTimestamp(transactions, solanaAddress);
  }, [
    solanaAddress,
    transactions,
    aegleFetcher,
    solanaNetwork,
    bitcoinNetwork,
  ]);

  const handleOnClose = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    totalAmount,
    handleOnClose,
  };
}

export default useZbtcMintedDialog;
