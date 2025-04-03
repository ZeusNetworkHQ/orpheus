import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  convertP2trToTweakedXOnlyPubkey,
  xOnlyPubkeyHexToP2tr,
} from "@/bitcoin";
import Button from "@/components/Button/Button";
import Chip from "@/components/Chip";
import Icon from "@/components/Icons";
import Pagination from "@/components/Pagination/Pagination";
import Table, {
  TableCell,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/Table";
import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import useInteractions from "@/hooks/hermes/useInteractions";
import { useFetchers } from "@/hooks/misc/useFetchers";
import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import usePersistentStore from "@/stores/persistentStore";
import {
  Interaction,
  interactionSchema,
  InteractionStatus,
  InteractionType,
  transactionSchema,
} from "@/types/api";
import { Chain } from "@/types/network";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatDate, formatValue, shortenString } from "@/utils/format";
import {
  getInteractionStatusDisplay,
  getWithdrawalAssetFrom,
  getWithdrawalAssetTo,
  getWithdrawalDetailsTableItems,
  getWithdrawalStatusItems,
} from "@/utils/interaction";
import { handleCopy } from "@/utils/misc";

import TransactionDetailsModal from "../Modals/TransactionDetails";

const PortfolioTransactionsWithdrawals = ({
  solanaPubkey,
}: {
  solanaPubkey: PublicKey | null;
}) => {
  const router = useRouter();
  const solanaNetwork = usePersistentStore((state) => state.solanaNetwork);
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const config = useNetworkConfig();
  const { aresFetcher, hermesFetcher } = useFetchers();
  const { wallet: bitcoinWallet } = useBitcoinWallet();
  const {
    data: transactions,
    hasNextPage,
    currentPage,
    itemsPerPage,
    handleItemsPerPage,
    handleNextPage,
    handlePrevPage,
  } = useInteractions(
    {
      solanaAddress: solanaPubkey?.toBase58(),
      destinationBitcoinAddress: bitcoinWallet
        ? convertP2trToTweakedXOnlyPubkey(bitcoinWallet.p2tr).toString("hex")
        : undefined,
      types: [InteractionType.Withdrawal],
      statuses: [
        InteractionStatus.AddWithdrawalRequest,
        InteractionStatus.AddUnlockToUserProposal,
        InteractionStatus.BitcoinUnlockToUser,
        InteractionStatus.VerifyUnlockToUserTransaction,
        InteractionStatus.SolanaUnlockToUser,
      ],
    },
    10
  );
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Interaction | null>(null);
  const [
    selectedTransactionConfirmations,
    setSelectedTransactionConfirmations,
  ] = useState(0);

  const handleDetailModalOpen = async (transaction: Interaction) => {
    try {
      const interactionDetail = await hermesFetcher(
        `/api/v1/raw/layer/interactions/${transaction.interaction_id}/steps`,
        interactionSchema
      );
      setSelectedTransaction(interactionDetail);

      let unlockToUserTxConfirmations = 0;

      const unlockToUserTxId = interactionDetail?.steps?.find(
        (step) => step.chain === Chain.Bitcoin && step.action === "UnlockToUser"
      )?.transaction;

      if (unlockToUserTxId) {
        const unlockToUserTxDetail = await aresFetcher(
          `/api/v1/transaction/${unlockToUserTxId}/detail`,
          transactionSchema
        );
        unlockToUserTxConfirmations = unlockToUserTxDetail?.confirmations ?? 0;
      }

      setSelectedTransactionConfirmations(unlockToUserTxConfirmations);
    } catch {
      setSelectedTransaction(transaction);
    }
    setDetailsModalOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-y-24">
      <div className="block">
        <Table
          tableType="stacked"
          width="auto"
          stickFirstItem
          stickLastItem
          variant="separated"
          columnSizes={[5, 5, 5, 6, 6, 4]}
          headers={[
            "Date",
            "Status",
            "Bitcoin Account",
            "Burned",
            "Unlocked",
            "Action",
          ]}
          headerSize="large"
        >
          <TableHeader />
          <TableBody>
            {transactions && transactions.length === 0 ? (
              <div className="bg-sys-color-background-card rounded-16 gradient-border border-apollo-border-15 mt-8 flex flex-col items-center justify-center gap-y-24 py-64 md:mt-0 md:border-none">
                <div className="flex flex-col items-center justify-center gap-y-16 text-center">
                  <div className="headline-headline5 text-sys-color-text-primary">
                    No In-Progress Request Yet
                  </div>
                  <div className="body-body2 text-sys-color-text-secondary">
                    You can only see transactions that you have made.
                  </div>
                </div>
                <Button
                  size="large"
                  type="primary"
                  label="Deposit Now"
                  icon="Stake"
                  className="!w-max"
                  onClick={() => router.push("/")}
                />
              </div>
            ) : (
              transactions?.map((item) => (
                <TableRow size="large" key={item.interaction_id}>
                  <TableCell
                    value={formatDate(item.initiated_at * 1000)}
                  ></TableCell>
                  <TableCell className="md:!py-0">
                    <span
                      className={classNames(
                        "text-sys-color-text-mute flex md:hidden"
                      )}
                    >
                      {getInteractionStatusDisplay(item.status)}
                    </span>
                    <Chip
                      size="large"
                      label={getInteractionStatusDisplay(item.status)}
                      className={classNames("hidden md:flex")}
                    />
                  </TableCell>
                  <TableCell
                    rightIcon="Copy"
                    rightIconClassName="transition text-sys-color-text-mute hover:text-sys-color-text-primary hover:cursor-pointer"
                    rightIconOnClick={() =>
                      handleCopy(
                        xOnlyPubkeyHexToP2tr(
                          item.destination,
                          bitcoinNetwork,
                          "tweaked"
                        )
                      )
                    }
                  >
                    {shortenString(
                      xOnlyPubkeyHexToP2tr(
                        item.destination,
                        bitcoinNetwork,
                        "tweaked"
                      ),
                      12
                    )}
                  </TableCell>
                  <TableCell
                    leftIcon="zbtc"
                    rightIcon={!item?.is_stored ? "Lock" : undefined}
                    rightIconClassName="text-sys-color-text-mute"
                  >
                    {formatValue(
                      new BigNumber(item.amount).dividedBy(10 ** BTC_DECIMALS),
                      6
                    )}{" "}
                    <span className="text-sys-color-text-mute">zBTC</span>
                  </TableCell>
                  <TableCell
                    leftIcon="btc"
                    rightIconClassName="text-sys-color-text-mute"
                  >
                    {formatValue(
                      new BigNumber(item.amount)
                        .minus(new BigNumber(item.miner_fee))
                        .minus(new BigNumber(item.service_fee))
                        .dividedBy(10 ** BTC_DECIMALS),
                      6
                    )}{" "}
                    <span className="text-sys-color-text-mute">BTC</span>
                  </TableCell>
                  <TableCell className="!w-full md:!py-0">
                    <div className="flex w-full grid-cols-2 gap-x-8 md:grid">
                      <div
                        className="relative z-10 flex cursor-pointer items-center gap-x-8 pl-12 md:p-0"
                        onClick={() => handleDetailModalOpen(item)}
                      >
                        <span>View</span>
                        <Icon name="NewWindow" size={18} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {transactions && transactions.length > 0 && (
        <Pagination
          showDropdown
          hasNextPage={hasNextPage}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handleItemsPerPage={handleItemsPerPage}
        />
      )}
      <TransactionDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        type="withdraw"
        tableItems={getWithdrawalDetailsTableItems(
          selectedTransaction,
          bitcoinNetwork,
          solanaNetwork,
          config.bitcoinExplorerUrl
        )}
        statusItems={getWithdrawalStatusItems(
          selectedTransaction,
          selectedTransactionConfirmations
        )}
        assetFrom={getWithdrawalAssetFrom(selectedTransaction)}
        assetTo={getWithdrawalAssetTo(selectedTransaction)}
      />
    </div>
  );
};

export default PortfolioTransactionsWithdrawals;
