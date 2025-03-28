import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  convertP2trToTweakedXOnlyPubkey,
  xOnlyPubkeyHexToP2tr,
} from "@/bitcoin";
import Button from "@/components/Button/Button";
import Chip from "@/components/Chip";
import { Dropdown, DropdownOption } from "@/components/Dropdown/Dropdown";
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
  InteractionType,
  Interaction,
  interactionSchema,
  transactionSchema,
  InteractionStatus,
} from "@/types/api";
import { Chain } from "@/types/network";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatDate, formatValue, shortenString } from "@/utils/format";
import {
  getDepositAssetFrom,
  getDepositAssetTo,
  getDepositDetailsTableItems,
  getDepositStatusItems,
  getInteractionStatusDisplay,
  getWithdrawalAssetFrom,
  getWithdrawalAssetTo,
  getWithdrawalDetailsTableItems,
  getWithdrawalStatusItems,
} from "@/utils/interaction";
import { handleCopy } from "@/utils/misc";

import TransactionDetailsModal from "../Modals/TransactionDetails";

const typeItems = ["Deposits", "Withdrawals"];

const PortfolioTransactionsHistorical = ({
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

  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);

  const {
    data: transactions,
    hasNextPage,
    currentPage,
    itemsPerPage,
    handleNextPage,
    handlePrevPage,
    handleResetPage,
    handleItemsPerPage,
  } = useInteractions(
    {
      solanaAddress: solanaPubkey?.toBase58(),
      sourceBitcoinAddress: bitcoinWallet
        ? toXOnly(Buffer.from(bitcoinWallet.pubkey, "hex")).toString("hex")
        : undefined,
      destinationBitcoinAddress: bitcoinWallet
        ? convertP2trToTweakedXOnlyPubkey(bitcoinWallet.p2tr).toString("hex")
        : undefined,
      types:
        selectedTypes.length > 0
          ? selectedTypes
              .map((type) =>
                type === 0
                  ? [InteractionType.Deposit]
                  : type === 1
                    ? [InteractionType.Withdrawal]
                    : []
              )
              .flat()
          : undefined,
      statuses: [InteractionStatus.Peg, InteractionStatus.Unpeg],
    },
    10
  );

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Interaction | null>(null);
  const [
    selectedTransactionConfirmations,
    setSelectedTransactionConfirmations,
  ] = useState<number[]>([]);

  const isDeposit =
    selectedTransaction?.interaction_type === InteractionType.Deposit;

  const handleDetailModalOpen = async (transaction: Interaction) => {
    try {
      const interactionDetail = await hermesFetcher(
        `/api/v1/raw/layer/interactions/${transaction.interaction_id}/steps`,
        interactionSchema
      );
      setSelectedTransaction(interactionDetail);

      if (isDeposit) {
        let depositToHotReserveTxConfirmations = 0;
        let lockToColdReserveTxConfirmations = 0;
        const depositToHotReserveTxId = interactionDetail?.steps?.find(
          (step) =>
            step.chain === Chain.Bitcoin &&
            step.action === "DepositToHotReserve"
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
      } else {
        let unlockToUserTxConfirmations = 0;

        const unlockToUserTxId = interactionDetail?.steps?.find(
          (step) =>
            step.chain === Chain.Bitcoin && step.action === "UnlockToUser"
        )?.transaction;

        if (unlockToUserTxId) {
          const unlockToUserTxDetail = await aresFetcher(
            `/api/v1/transaction/${unlockToUserTxId}/detail`,
            transactionSchema
          );
          unlockToUserTxConfirmations =
            unlockToUserTxDetail?.confirmations ?? 0;
        }

        setSelectedTransactionConfirmations([unlockToUserTxConfirmations]);
      }
    } catch {
      setSelectedTransaction(transaction);
    }
    setDetailsModalOpen(true);
  };

  const handleSelectedTransactionType = (index: number) => {
    setSelectedTypes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
    handleResetPage();
  };

  return (
    <div className="flex flex-col gap-y-24">
      <div className="flex w-full flex-wrap gap-8 md:justify-end">
        <Dropdown
          className="!w-[calc(50%-4px)] md:!w-max"
          type="filter"
          label="Type"
          selectedIndex={selectedTypes}
        >
          {typeItems.map((item, index) => (
            <DropdownOption
              label="Deposits"
              key={item}
              index={index}
              onClick={() => handleSelectedTransactionType(index)}
            >
              {item}
            </DropdownOption>
          ))}
        </Dropdown>
      </div>
      <div className="block">
        <Table
          stickFirstItem
          stickLastItem
          tableType="stacked"
          width="auto"
          variant="separated"
          columnSizes={[5, 3, 4, 5, 6, 6, 3]}
          headers={[
            "Date",
            "Type",
            "Status",
            "Bitcoin Account",
            "From",
            "To",
            "Action",
          ]}
          headerSize="large"
        >
          <TableHeader />
          <TableBody>
            {/* <div className="fixed h-full w-full [clip-path:inset(0_0_0_0_round_16px)]"></div> */}
            {transactions && transactions.length === 0 ? (
              <div className="bg-sys-color-background-card rounded-16 gradient-border border-apollo-border-15 mt-8 flex flex-col items-center justify-center gap-y-24 py-64 md:mt-0 md:border-none">
                <div className="flex flex-col items-center justify-center gap-y-16 text-center">
                  <div className="headline-headline5 text-sys-color-text-primary">
                    {selectedTypes.length > 0
                      ? "No Result Found"
                      : "No Completed Request Yet"}
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
              transactions.map((item) => (
                <TableRow size="large" key={item.interaction_id}>
                  <TableCell
                    value={formatDate(item.initiated_at * 1000)}
                  ></TableCell>
                  <TableCell>
                    {item.interaction_type === InteractionType.Deposit
                      ? "Deposit"
                      : "Withdrawal"}
                  </TableCell>
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
                      className="hidden md:flex"
                    />
                  </TableCell>
                  <TableCell
                    rightIcon="Copy"
                    rightIconClassName="transition text-sys-color-text-mute hover:text-sys-color-text-primary hover:cursor-pointer"
                    rightIconOnClick={() => {
                      handleCopy(
                        item.interaction_type === InteractionType.Deposit
                          ? xOnlyPubkeyHexToP2tr(
                              item.source,
                              bitcoinNetwork,
                              "internal"
                            )
                          : xOnlyPubkeyHexToP2tr(
                              item.destination,
                              bitcoinNetwork,
                              "tweaked"
                            )
                      );
                    }}
                  >
                    {item.interaction_type === InteractionType.Deposit
                      ? shortenString(
                          xOnlyPubkeyHexToP2tr(
                            item.source,
                            bitcoinNetwork,
                            "internal"
                          ),
                          12
                        )
                      : shortenString(
                          xOnlyPubkeyHexToP2tr(
                            item.destination,
                            bitcoinNetwork,
                            "tweaked"
                          ),
                          12
                        )}
                  </TableCell>
                  <TableCell
                    leftIcon={
                      item.interaction_type === InteractionType.Deposit
                        ? "btc"
                        : "zbtc"
                    }
                    rightIcon={
                      item.interaction_type === InteractionType.Withdrawal &&
                      !item.is_stored
                        ? "Lock"
                        : undefined
                    }
                    rightIconClassName="text-sys-color-text-mute"
                  >
                    {formatValue(
                      new BigNumber(item.amount).dividedBy(10 ** BTC_DECIMALS),
                      6
                    )}{" "}
                    <span className="text-sys-color-text-mute">
                      {item.interaction_type === InteractionType.Deposit
                        ? "BTC"
                        : "ZBTC"}
                    </span>
                  </TableCell>
                  <TableCell
                    leftIcon={
                      item.interaction_type === InteractionType.Deposit
                        ? "zbtc"
                        : "btc"
                    }
                    rightIcon={
                      item.interaction_type === InteractionType.Deposit
                        ? "Lock"
                        : undefined
                    }
                    rightIconClassName="text-sys-color-text-mute"
                  >
                    {formatValue(
                      new BigNumber(item.amount)
                        .minus(new BigNumber(item.miner_fee))
                        .minus(new BigNumber(item.service_fee))
                        .dividedBy(10 ** BTC_DECIMALS),
                      6
                    )}{" "}
                    <span className="text-sys-color-text-mute">
                      {item.interaction_type === InteractionType.Deposit
                        ? "zBTC"
                        : "BTC"}
                    </span>
                  </TableCell>
                  <TableCell className="!w-full md:!py-0">
                    <div
                      className="relative z-10 ml-auto flex cursor-pointer items-center gap-x-8 md:!ml-0"
                      onClick={() => handleDetailModalOpen(item)}
                    >
                      <span>View</span>
                      <Icon name="NewWindow" size={18} />
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
          handleItemsPerPage={handleItemsPerPage}
          handleNextPage={handleNextPage}
          handlePrevPage={handlePrevPage}
        />
      )}
      {/* Transaction details modal */}
      <TransactionDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        type={isDeposit ? "deposit" : "withdraw"}
        tableItems={
          isDeposit
            ? getDepositDetailsTableItems(
                selectedTransaction,
                bitcoinNetwork,
                solanaNetwork,
                config.bitcoinExplorerUrl
              )
            : getWithdrawalDetailsTableItems(
                selectedTransaction,
                bitcoinNetwork,
                solanaNetwork,
                config.bitcoinExplorerUrl
              )
        }
        statusItems={
          isDeposit
            ? getDepositStatusItems(
                selectedTransaction,
                selectedTransactionConfirmations?.[0],
                selectedTransactionConfirmations?.[1]
              )
            : getWithdrawalStatusItems(
                selectedTransaction,
                selectedTransactionConfirmations?.[0]
              )
        }
        assetFrom={
          isDeposit
            ? getDepositAssetFrom(selectedTransaction)
            : getWithdrawalAssetFrom(selectedTransaction)
        }
        assetTo={
          isDeposit
            ? getDepositAssetTo(selectedTransaction)
            : getWithdrawalAssetTo(selectedTransaction)
        }
      />
    </div>
  );
};

export default PortfolioTransactionsHistorical;
