import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { xOnlyPubkeyHexToP2tr } from "@/bitcoin";
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
import useDepositInteractionsWithCache from "@/hooks/hermes/useDepositInteractionsWithCache";
import { useFetchers } from "@/hooks/misc/useFetchers";
import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import useTwoWayPegConfiguration from "@/hooks/zpl/useTwoWayPegConfiguration";
import usePersistentStore from "@/stores/persistentStore";
import { Interaction, interactionSchema, transactionSchema } from "@/types/api";
import { Chain } from "@/types/network";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue, formatDate, shortenString } from "@/utils/format";
import {
  getDepositDetailsTableItems,
  getDepositStatusItems,
  getDepositAssetFrom,
  getDepositAssetTo,
  getInteractionStatusDisplay,
  getEstimatedDepositTransactionFee,
} from "@/utils/interaction";
import { handleCopy } from "@/utils/misc";

import TransactionDetailsModal from "../Modals/TransactionDetails";

const PortfolioTransactionsDeposits = ({
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
  const { feeRate } = useTwoWayPegConfiguration();
  const {
    combinedInteractions: combinedTransactions,
    hasNextPage,
    currentPage,
    itemsPerPage,
    handleItemsPerPage,
    handleNextPage,
    handlePrevPage,
  } = useDepositInteractionsWithCache({
    solanaAddress: solanaPubkey?.toBase58(),
    bitcoinXOnlyPubkey: bitcoinWallet
      ? toXOnly(Buffer.from(bitcoinWallet.pubkey, "hex")).toString("hex")
      : undefined,
  });

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Interaction | null>(null);
  const [
    selectedTransactionConfirmations,
    setSelectedTransactionConfirmations,
  ] = useState<number[]>([]);

  const handleDetailModalOpen = async (transaction: Interaction) => {
    try {
      const interactionDetail = await hermesFetcher(
        `/api/v1/raw/layer/interactions/${transaction.interaction_id}/steps`,
        interactionSchema
      );
      console.log("interactionDetail", interactionDetail);
      setSelectedTransaction(interactionDetail);

      let depositToHotReserveTxConfirmations = 0;
      let lockToColdReserveTxConfirmations = 0;

      const depositToHotReserveTxId = interactionDetail?.steps?.find(
        (step) =>
          step.chain === Chain.Bitcoin && step.action === "DepositToHotReserve"
      )?.transaction;

      if (depositToHotReserveTxId) {
        const depositToHotReserveTxDetail = await aresFetcher(
          `/api/v1/transaction/${depositToHotReserveTxId}/detail`,
          transactionSchema
        );
        depositToHotReserveTxConfirmations =
          depositToHotReserveTxDetail?.confirmations ?? 0;
      }

      const lockToColdReserveTxId = interactionDetail?.steps?.find(
        (step) =>
          step.chain === Chain.Bitcoin && step.action === "LockToColdReserve"
      )?.transaction;

      if (lockToColdReserveTxId) {
        const lockToColdReserveTxDetail = await aresFetcher(
          `/api/v1/transaction/${lockToColdReserveTxId}/detail`,
          transactionSchema
        );
        lockToColdReserveTxConfirmations =
          lockToColdReserveTxDetail?.confirmations ?? 0;
      }

      setSelectedTransactionConfirmations([
        depositToHotReserveTxConfirmations,
        lockToColdReserveTxConfirmations,
      ]);
    } catch {
      setSelectedTransaction(transaction);
    }
    setDetailsModalOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-y-24">
      <div className="block w-full">
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
            "Locked",
            "Minted",
            "Action",
          ]}
          headerSize="large"
          showDividerOnMobile
          hideLastDividerOnMobile
        >
          <TableHeader />
          <TableBody>
            {combinedTransactions.length === 0 ? (
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
              combinedTransactions.map((item) => (
                <TableRow size="large" key={item.interaction_id}>
                  <TableCell
                    value={formatDate(item.initiated_at * 1000)}
                  ></TableCell>
                  <TableCell className="md:!py-0">
                    <span
                      className={classNames(
                        "text-sys-color-text-mute flex md:hidden",
                        getInteractionStatusDisplay(item.status) ===
                          "Pending" && "!text-apollo-brand-primary-blue"
                      )}
                    >
                      {item.deposit_block
                        ? getInteractionStatusDisplay(item.status)
                        : "Initiating"}
                    </span>
                    <Chip
                      size="large"
                      label={
                        item.deposit_block
                          ? getInteractionStatusDisplay(item.status)
                          : "Initiating"
                      }
                      className={classNames(
                        "hidden md:flex",
                        getInteractionStatusDisplay(item.status) ===
                          "Pending" &&
                          "!bg-apollo-brand-primary-blue/5 !text-apollo-brand-primary-blue"
                      )}
                    />
                  </TableCell>
                  <TableCell
                    rightIcon="Copy"
                    rightIconClassName="transition text-sys-color-text-mute hover:text-sys-color-text-primary hover:cursor-pointer"
                    rightIconOnClick={() => {
                      handleCopy(
                        xOnlyPubkeyHexToP2tr(
                          item.source,
                          bitcoinNetwork,
                          "internal"
                        )
                      );
                    }}
                  >
                    {shortenString(
                      xOnlyPubkeyHexToP2tr(
                        item.source,
                        bitcoinNetwork,
                        "internal"
                      ),
                      10
                    )}
                  </TableCell>
                  <TableCell leftIcon={"btc"}>
                    {formatValue(
                      new BigNumber(item.amount).dividedBy(10 ** BTC_DECIMALS),
                      6
                    )}{" "}
                    <span className="text-sys-color-text-mute">BTC</span>
                  </TableCell>
                  <TableCell
                    leftIcon={"zbtc"}
                    rightIcon="Lock"
                    rightIconClassName="text-sys-color-text-mute"
                  >
                    {formatValue(
                      new BigNumber(item.amount)
                        .minus(
                          new BigNumber(
                            Number(item.miner_fee) > 0
                              ? item.miner_fee
                              : getEstimatedDepositTransactionFee(feeRate)
                          )
                        )
                        .dividedBy(10 ** BTC_DECIMALS),
                      6
                    )}{" "}
                    <span className="text-sys-color-text-mute">zBTC</span>
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
      {combinedTransactions && combinedTransactions.length > 0 && (
        <Pagination
          showDropdown
          hasNextPage={hasNextPage}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handleItemsPerPage={handleItemsPerPage}
          handleNextPage={handleNextPage}
          handlePrevPage={handlePrevPage}
        />
      )}
      <TransactionDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        type="deposit"
        tableItems={getDepositDetailsTableItems(
          selectedTransaction,
          bitcoinNetwork,
          solanaNetwork,
          config.bitcoinExplorerUrl,
          feeRate
        )}
        statusItems={getDepositStatusItems(
          selectedTransaction,
          selectedTransactionConfirmations?.[0],
          selectedTransactionConfirmations?.[1]
        )}
        assetFrom={getDepositAssetFrom(selectedTransaction)}
        assetTo={getDepositAssetTo(selectedTransaction, feeRate)}
      />
    </div>
  );
};

export default PortfolioTransactionsDeposits;
