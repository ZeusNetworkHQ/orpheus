import useSWR from "swr";

import usePersistentStore from "@/stores/persistentStore";
import {
  Interaction,
  interactionSchema,
  InteractionStatus,
  InteractionType,
  transactionSchema,
  UTXOs,
} from "@/types/api";
import { BitcoinNetwork } from "@/types/store";
import { Fetcher } from "@/utils/axios";
import { xOnlyPubkeyHexToP2tr } from "@/utils/bitcoin";
import transactionRepo from "@/utils/indexedDB/transaction";
import utxoRepo from "@/utils/indexedDB/utxo";

import { useFetchers } from "./useFetchers";
import useTransactions from "./useTransactions";

function useDepositTransactionsWithCache(query: {
  solanaAddress?: string;
  bitcoinXOnlyPubkey?: string;
}) {
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const { aresFetcher, hermesFetcher } = useFetchers();

  const {
    data: transactions,
    hasNextPage,
    currentPage,
    itemsPerPage,
    handleItemsPerPage,
    handleNextPage,
    handlePrevPage,
    mutate: mutateTransactions,
  } = useTransactions(
    {
      solanaAddress: query.solanaAddress,
      sourceBitcoinAddress: query.bitcoinXOnlyPubkey,
      types: [InteractionType.Deposit],
      statuses: [
        InteractionStatus.BitcoinDepositToHotReserve,
        InteractionStatus.VerifyDepositToHotReserveTransaction,
        InteractionStatus.SolanaDepositToHotReserve,
        InteractionStatus.AddLockToColdReserveProposal,
        InteractionStatus.BitcoinLockToColdReserve,
        InteractionStatus.VerifyLockToColdReserveTransaction,
        InteractionStatus.SolanaLockToColdReserve,
      ],
    },
    10
  );

  const {
    data: combinedTransactions,
    mutate: mutateCachedTransactions,
    error,
    isLoading,
  } = useSWR<{ transactions: Interaction[]; cachedUtxos: UTXOs }>(
    query.solanaAddress
      ? [
          aresFetcher,
          query.solanaAddress,
          query.bitcoinXOnlyPubkey,
          transactions,
          currentPage,
          bitcoinNetwork,
        ]
      : null,
    async ([
      aresFetcher,
      solanaAddress,
      bitcoinXOnlyPubkey,
      apiTransactions,
      currentPage,
      bitcoinNetwork,
    ]: [Fetcher, string, string, Interaction[], number, BitcoinNetwork]) => {
      if (currentPage !== 1 || !apiTransactions) {
        return { transactions: apiTransactions || [], cachedUtxos: [] };
      }

      const cachedTransactions =
        (await transactionRepo.getInteractions(
          bitcoinNetwork,
          solanaAddress
        )) ?? [];

      let filteredCachedTransactions = (
        await Promise.all(
          cachedTransactions.toReversed().map(async (cachedTx) => {
            // NOTE: Prevent filtering out the latest transactions not yet sent to mempool
            if (Date.now() / 1000 - cachedTx.initiated_at < 60) {
              return cachedTx;
            }

            // NOTE: If transaction is confirmed, delete UTXO cache, and if transaction id is not found, delete transaction cache
            try {
              const transactionId = cachedTx.steps?.[0].transaction;
              if (!transactionId) return [];

              const transactionDetail = await aresFetcher(
                `/api/v1/transaction/${transactionId}/detail`,
                transactionSchema
              );
              if (transactionDetail.confirmations) {
                await utxoRepo.deleteUTXOs(
                  xOnlyPubkeyHexToP2tr(
                    cachedTx.source,
                    bitcoinNetwork,
                    "internal"
                  ),
                  transactionId
                );
              }
            } catch {
              return [];
            }

            // NOTE: If interaction is complete, delete transaction cache
            try {
              const interactionId = cachedTx.interaction_id;
              const interactionDetail = await hermesFetcher(
                `/api/v1/raw/layer/interactions/${interactionId}/steps`,
                interactionSchema
              );
              if (interactionDetail.status === InteractionStatus.Peg) {
                return [];
              }
            } catch {
              return cachedTx;
            }

            return cachedTx;
          })
        )
      )
        .flat()
        // NOTE: If apiTransactions has the same interaction_id, remove it from cachedTransactions
        .filter(
          (cachedTx) =>
            !apiTransactions.some(
              (tx) => tx.interaction_id === cachedTx.interaction_id
            )
        );

      // NOTE: Update filtered cached transactions in indexedDB
      if (filteredCachedTransactions.length !== cachedTransactions.length) {
        await transactionRepo.updateInteractions(
          bitcoinNetwork,
          solanaAddress,
          filteredCachedTransactions
        );
      }

      // NOTE: filter by user bitcoin wallet without updating the cache in indexedDB
      if (bitcoinXOnlyPubkey) {
        filteredCachedTransactions = filteredCachedTransactions.filter(
          (cachedTx) => bitcoinXOnlyPubkey === cachedTx.source
        );
      }
      const cachedUtxos: UTXOs = bitcoinXOnlyPubkey
        ? (
            await utxoRepo.getUTXOs(
              xOnlyPubkeyHexToP2tr(
                bitcoinXOnlyPubkey,
                bitcoinNetwork,
                "internal"
              )
            )
          )
            ?.map((cache) => cache.utxos)
            .flat()
        : [];

      return {
        transactions: [...filteredCachedTransactions, ...apiTransactions],
        cachedUtxos,
      };
    },
    {
      keepPreviousData: true,
      dedupingInterval: 10000,
    }
  );

  return {
    apiTransactions: transactions ?? [],
    combinedTransactions: combinedTransactions?.transactions ?? [],
    cachedUtxos: combinedTransactions?.cachedUtxos ?? [],
    mutate: async () => {
      await mutateTransactions();
      await mutateCachedTransactions();
    },
    hasNextPage,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    handleItemsPerPage,
    handleNextPage,
    handlePrevPage,
  };
}

export default useDepositTransactionsWithCache;
