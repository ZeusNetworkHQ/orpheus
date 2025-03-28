import BigNumber from "bignumber.js";

import { getFullBitcoinExplorerUrl, xOnlyPubkeyHexToP2tr } from "@/bitcoin";
import { Interaction, InteractionStatus } from "@/types/api";
import { Chain } from "@/types/network";
import { BitcoinNetwork, SolanaNetwork } from "@/types/store";
import {
  TransactionDetailsStatusItems,
  TransactionDetailsTableItems,
  TransactionDetailsAsset,
} from "@/types/transaction";

import { BTC_DECIMALS, DEFAULT_LAYER_FEE, ZEUS_SCAN_URL } from "./constant";
import { formatDate, formatValue } from "./format";
import { getSolanaExplorerUrl } from "./misc";

export const ESTIMATED_DEPOSIT_TRANSACTION_VBYTE = 100;
export const ESTIMATED_WITHDRAWAL_TRANSACTION_VBYTE = 40;

export const getEstimatedLockToColdTransactionFee = (
  satPerVbyte: number
): number => {
  return ESTIMATED_DEPOSIT_TRANSACTION_VBYTE * satPerVbyte;
};

export const getEstimatedDepositTransactionFee = (
  satPerVbyte: number
): number => {
  return ESTIMATED_DEPOSIT_TRANSACTION_VBYTE * satPerVbyte;
};

export const getEstimatedWithdrawalTransactionFee = (satPerVbyte: number) => {
  return ESTIMATED_WITHDRAWAL_TRANSACTION_VBYTE * satPerVbyte;
};

export const getFullZeusScanUrl = (
  interactionId: string,
  zeusScanUrl: string,
  solanaNetwork: SolanaNetwork,
  bitcoinNetwork: BitcoinNetwork
): string => {
  return `${zeusScanUrl}/interaction/${interactionId}?network=${bitcoinNetwork}-${solanaNetwork}`;
};

const INTERACTION_STATUS_MAP: Record<InteractionStatus, string> = {
  // Deposit
  [InteractionStatus.BitcoinDepositToHotReserve]: "Submitting",
  [InteractionStatus.VerifyDepositToHotReserveTransaction]: "Submitting",
  [InteractionStatus.SolanaDepositToHotReserve]: "Submitting",
  [InteractionStatus.AddLockToColdReserveProposal]: "Locking",
  [InteractionStatus.BitcoinLockToColdReserve]: "Locking",
  [InteractionStatus.VerifyLockToColdReserveTransaction]: "Locking",
  [InteractionStatus.SolanaLockToColdReserve]: "Locking",
  [InteractionStatus.Peg]: "Complete",
  [InteractionStatus.Reclaim]: "Reclaimed",

  // Withdrawal
  [InteractionStatus.AddWithdrawalRequest]: "Initiating",
  [InteractionStatus.AddUnlockToUserProposal]: "Unlocking",
  [InteractionStatus.BitcoinUnlockToUser]: "Unlocking",
  [InteractionStatus.VerifyUnlockToUserTransaction]: "Unlocking",
  [InteractionStatus.SolanaUnlockToUser]: "Unlocking",
  [InteractionStatus.Unpeg]: "Complete",
  [InteractionStatus.DeprecateWithdrawalRequest]: "Cancelled",

  [InteractionStatus.Empty]: "Unknown",
};

export const getInteractionStatusDisplay = (status: InteractionStatus) => {
  return INTERACTION_STATUS_MAP[status];
};

// Deposit
export const getDepositDetailsTableItems = (
  selectedTransaction: Interaction | null,
  bitcoinNetwork: BitcoinNetwork,
  solanaNetwork: SolanaNetwork,
  bitcoinExplorerUrl: string,
  feeRate?: number
): TransactionDetailsTableItems | null => {
  if (!selectedTransaction) return null;

  const lockToColdReserveTxId = selectedTransaction?.steps?.find(
    (step) =>
      step.chain === Chain.Bitcoin && step.action === "LockToColdReserve"
  )?.transaction;

  return [
    {
      label: {
        label: "Interaction ID",
      },
      value: selectedTransaction.deposit_block
        ? {
            label: selectedTransaction.interaction_id,
            rightIcon: "NewWindow",
            link: getFullZeusScanUrl(
              selectedTransaction.interaction_id,
              ZEUS_SCAN_URL,
              solanaNetwork,
              bitcoinNetwork
            ),
          }
        : {
            label: "Processing",
          },
    },
    {
      label: {
        label: "From",
        caption: "Bitcoin",
      },
      value: {
        label: xOnlyPubkeyHexToP2tr(selectedTransaction.source, bitcoinNetwork),
        link: getFullBitcoinExplorerUrl(
          xOnlyPubkeyHexToP2tr(selectedTransaction.source, bitcoinNetwork),
          bitcoinExplorerUrl,
          "address"
        ),
        rightIcon: "Copy",
      },
    },
    {
      label: {
        label: "To",
        caption: "Solana",
      },
      value: {
        label: selectedTransaction.destination,
        link: getSolanaExplorerUrl(
          solanaNetwork,
          "address",
          selectedTransaction.destination
        ),
        rightIcon: "Copy",
      },
    },
    {
      label: {
        label: "Miner Fee",
      },
      value: {
        label: `${
          Number(selectedTransaction.miner_fee) > 0
            ? formatValue(
                new BigNumber(selectedTransaction.miner_fee).dividedBy(
                  10 ** BTC_DECIMALS
                ),
                6
              )
            : formatValue(
                new BigNumber(
                  getEstimatedDepositTransactionFee(feeRate ?? 1)
                ).dividedBy(10 ** BTC_DECIMALS),
                6
              )
        } BTC`,
        leftIcon: "btc",
      },
    },
    {
      label: {
        label: "Submit BTC TxID",
      },
      value: {
        label:
          selectedTransaction?.steps?.find(
            (step) =>
              step.chain === Chain.Bitcoin &&
              step.action === "DepositToHotReserve"
          )?.transaction ?? "Processing",
        rightIcon: "NewWindow",
        link: getFullBitcoinExplorerUrl(
          selectedTransaction?.steps?.find(
            (step) =>
              step.chain === Chain.Bitcoin &&
              step.action === "DepositToHotReserve"
          )?.transaction ?? "",
          bitcoinExplorerUrl
        ),
      },
    },
    {
      label: {
        label: "Lock BTC TxID",
      },
      value: {
        label: lockToColdReserveTxId ?? "Processing",
        rightIcon: lockToColdReserveTxId ? "NewWindow" : undefined,
        link: lockToColdReserveTxId
          ? getFullBitcoinExplorerUrl(lockToColdReserveTxId, bitcoinExplorerUrl)
          : undefined,
      },
    },
  ];
};

export const getDepositStatusItems = (
  selectedTransaction: Interaction | null,
  depositToHotReserveTxConfirmations: number,
  lockToColdReserveTxConfirmations: number
): TransactionDetailsStatusItems => {
  const submitBtcCompleteAction = selectedTransaction?.steps?.find(
    (step) => step.action === "VerifyDepositToHotReserveTransaction"
  );
  const lockBtcCompleteAction = selectedTransaction?.steps?.find(
    (step) => step.action === "VerifyLockToColdReserveTransaction"
  );
  const interactionCompleteAction = selectedTransaction?.steps?.find(
    (step) => step.action === "Peg"
  );

  return [
    {
      status: selectedTransaction?.deposit_block ? "complete" : "pending",
      label: "Initiating",
      subLabel: selectedTransaction
        ? formatDate(selectedTransaction.initiated_at * 1000)
        : "-",
    },
    {
      status: submitBtcCompleteAction
        ? "complete"
        : selectedTransaction?.deposit_block
          ? "pending"
          : "not-started",
      label: "Submit BTC",
      subLabel: submitBtcCompleteAction
        ? formatDate(submitBtcCompleteAction.timestamp * 1000)
        : depositToHotReserveTxConfirmations
          ? `${depositToHotReserveTxConfirmations} Confirmations`
          : "",
    },
    {
      status: lockBtcCompleteAction
        ? "complete"
        : selectedTransaction?.steps?.find(
              (step) => step.action === "AddLockToColdReserveProposal"
            )
          ? "pending"
          : "not-started",
      label: "Lock BTC",
      subLabel: lockBtcCompleteAction
        ? formatDate(lockBtcCompleteAction.timestamp * 1000)
        : lockToColdReserveTxConfirmations
          ? `${lockToColdReserveTxConfirmations} Confirmations`
          : "",
    },
    {
      status: interactionCompleteAction
        ? "complete"
        : selectedTransaction?.steps?.find(
              (step) =>
                step.chain === Chain.Solana &&
                step.action === "LockToColdReserve"
            )
          ? "pending"
          : "not-started",
      label: "Complete",
      subLabel: interactionCompleteAction
        ? formatDate(interactionCompleteAction.timestamp * 1000)
        : "",
    },
  ];
};

export const getDepositAssetFrom = (
  selectedTransaction: Interaction | null
): TransactionDetailsAsset => {
  return {
    name: "BTC",
    amount: selectedTransaction
      ? formatValue(
          new BigNumber(selectedTransaction.amount).dividedBy(
            10 ** BTC_DECIMALS
          ),
          6
        )
      : "-",
    isLocked: false,
  };
};

export const getDepositAssetTo = (
  selectedTransaction: Interaction | null,
  feeRate?: number
): TransactionDetailsAsset => {
  return {
    name: "zBTC",
    amount: selectedTransaction
      ? formatValue(
          new BigNumber(selectedTransaction.amount)
            .minus(
              new BigNumber(
                Number(selectedTransaction.miner_fee) > 0
                  ? selectedTransaction.miner_fee
                  : getEstimatedDepositTransactionFee(feeRate ?? 1)
              )
            )
            .dividedBy(10 ** BTC_DECIMALS),
          6
        )
      : "-",
    isLocked: true,
  };
};

// Withdrawal
export const getWithdrawalDetailsTableItems = (
  selectedTransaction: Interaction | null,
  bitcoinNetwork: BitcoinNetwork,
  solanaNetwork: SolanaNetwork,
  bitcoinExplorerUrl: string
): TransactionDetailsTableItems | null => {
  if (!selectedTransaction) return null;

  const unlockToUserTxId = selectedTransaction?.steps?.find(
    (step) => step.chain === Chain.Bitcoin && step.action === "UnlockToUser"
  )?.transaction;

  return [
    {
      label: {
        label: "Interaction ID",
      },
      value: {
        label: selectedTransaction.interaction_id,
        rightIcon: "NewWindow",
        link: getFullZeusScanUrl(
          selectedTransaction.interaction_id,
          ZEUS_SCAN_URL,
          solanaNetwork,
          bitcoinNetwork
        ),
      },
    },
    {
      label: {
        label: "From",
        caption: "Solana",
      },
      value: {
        label: selectedTransaction.source,
        link: getSolanaExplorerUrl(
          solanaNetwork,
          "address",
          selectedTransaction.source
        ),
        rightIcon: "Copy",
      },
    },
    {
      label: {
        label: "To",
        caption: "Bitcoin",
      },
      value: {
        label: xOnlyPubkeyHexToP2tr(
          selectedTransaction.destination,
          bitcoinNetwork,
          "tweaked"
        ),
        link: getFullBitcoinExplorerUrl(
          xOnlyPubkeyHexToP2tr(
            selectedTransaction.destination,
            bitcoinNetwork,
            "tweaked"
          ),
          bitcoinExplorerUrl,
          "address"
        ),
        rightIcon: "Copy",
      },
    },
    {
      label: {
        label: "Miner Fee",
      },
      value: {
        label: `${formatValue(
          new BigNumber(selectedTransaction.miner_fee).dividedBy(
            10 ** BTC_DECIMALS
          ),
          8
        ).replace(/\.?0+$/, "")} BTC`,
        leftIcon: "btc",
      },
    },
    {
      label: {
        label: "Service Fee",
        rightIcon: "InfoSmall",
        info: "The Service Fee is deducted from the final received BTC amount by Orpheus.",
      },
      value: {
        label: `${formatValue(
          new BigNumber(selectedTransaction.service_fee).dividedBy(
            10 ** BTC_DECIMALS
          ),
          6
        )} zBTC`,
        leftIcon: "zbtc",
      },
    },
    {
      label: {
        label: "Layer Fee",
      },
      value: {
        label: `${String(DEFAULT_LAYER_FEE)} SOL`,
        leftIcon: "solana",
      },
    },
    {
      label: {
        label: "Unlock BTC TxID",
      },
      value: {
        label: unlockToUserTxId ?? "Processing",
        rightIcon: unlockToUserTxId ? "NewWindow" : undefined,
        link: unlockToUserTxId
          ? getFullBitcoinExplorerUrl(unlockToUserTxId, bitcoinExplorerUrl)
          : undefined,
      },
    },
  ];
};

export const getWithdrawalStatusItems = (
  selectedTransaction: Interaction | null,
  selectedTransactionConfirmations: number
): TransactionDetailsStatusItems => {
  const unlockBtcCompleteAction = selectedTransaction?.steps?.find(
    (step) => step.action === "VerifyUnlockToUserTransaction"
  );

  const interactionCompleteAction = selectedTransaction?.steps?.find(
    (step) => step.action === "Unpeg"
  );

  return [
    {
      status: selectedTransaction?.steps?.find(
        (step) => step.action === "AddWithdrawalRequest"
      )
        ? "complete"
        : "pending",
      label: "Initiating",
      subLabel: selectedTransaction
        ? formatDate(selectedTransaction.initiated_at * 1000)
        : "",
    },
    {
      status: unlockBtcCompleteAction
        ? "complete"
        : selectedTransaction?.steps?.find(
              (step) => step.action === "AddUnlockToUserProposal"
            )
          ? "pending"
          : "not-started",
      label: "Unlock BTC",
      subLabel: unlockBtcCompleteAction
        ? formatDate(unlockBtcCompleteAction.timestamp * 1000)
        : selectedTransactionConfirmations
          ? `${selectedTransactionConfirmations} Confirmations`
          : "",
    },
    {
      status: interactionCompleteAction
        ? "complete"
        : selectedTransaction?.steps?.find(
              (step) =>
                step.chain === Chain.Solana && step.action === "UnlockToUser"
            )
          ? "pending"
          : "not-started",
      label: "Complete",
      subLabel: interactionCompleteAction
        ? formatDate(interactionCompleteAction.timestamp * 1000)
        : "",
    },
  ];
};

export const getWithdrawalAssetFrom = (
  selectedTransaction: Interaction | null
): TransactionDetailsAsset => {
  return {
    name: "zBTC",
    amount: selectedTransaction
      ? formatValue(
          new BigNumber(selectedTransaction.amount).dividedBy(
            10 ** BTC_DECIMALS
          ),
          6
        )
      : "-",
    isLocked: selectedTransaction ? !selectedTransaction.is_stored : true,
  };
};

export const getWithdrawalAssetTo = (
  selectedTransaction: Interaction | null
): TransactionDetailsAsset => {
  return {
    name: "BTC",
    amount: selectedTransaction
      ? formatValue(
          new BigNumber(selectedTransaction.amount)
            .minus(selectedTransaction.miner_fee)
            .minus(selectedTransaction.service_fee)
            .dividedBy(10 ** BTC_DECIMALS),
          6
        )
      : "-",
    isLocked: false,
  };
};
