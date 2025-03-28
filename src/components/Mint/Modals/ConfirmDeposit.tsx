import { captureException } from "@sentry/nextjs";
import { PublicKey } from "@solana/web3.js";
import { AxiosError } from "axios";
import BigNumber from "bignumber.js";
import * as bitcoin from "bitcoinjs-lib";
import { Psbt } from "bitcoinjs-lib";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import { BN } from "bn.js";
import classNames from "classnames";
import { useState } from "react";

import { btcToSatoshi, convertBitcoinNetwork } from "@/bitcoin";
import { constructDepositToHotReserveTx } from "@/bitcoin";
import { sendTransaction } from "@/bitcoin/rpcClient";
import { getInternalXOnlyPubkeyFromUserWallet } from "@/bitcoin/wallet";
import Button from "@/components/Button/Button";
import Icon from "@/components/Icons";
import { IconName } from "@/components/Icons/icons";
import {
  Modal,
  ModalActions,
  ModalHeader,
} from "@/components/ShadcnModal/Modal";
import { useZplClient } from "@/contexts/ZplClientProvider";
import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import useTwoWayPegConfiguration from "@/hooks/zpl/useTwoWayPegConfiguration";
import usePersistentStore from "@/stores/persistentStore";
import useStore from "@/stores/store";
import {
  Interaction,
  InteractionStatus,
  InteractionType,
  UTXOs,
} from "@/types/api";
import { Chain } from "@/types/network";
import { BitcoinWallet } from "@/types/wallet";
import { createAxiosInstances } from "@/utils/axios";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";
import transactionRepo from "@/utils/indexedDB/transaction";
import utxoRepo from "@/utils/indexedDB/utxo";
import { notifyError, notifyTx } from "@/utils/notification";

export interface ConfirmDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  solanaPubkey: PublicKey | null;
  bitcoinWallet: BitcoinWallet | null;
  bitcoinUTXOs: UTXOs | undefined;
  depositAmount: number;
  minerFee: number;
  assetFrom: {
    name: string;
    amount: string;
    isLocked: boolean;
  };
  assetTo: {
    name: string;
    amount: string;
    isLocked: boolean;
  };
  isDepositAll: boolean;
  signPsbt: (psbt: Psbt, tweaked?: boolean) => Promise<string>;
  updateTransactions: () => Promise<void>;
  resetProvideAmountValue: () => void;
}

export default function ConfirmDepositModal({
  isOpen,
  onClose,
  solanaPubkey,
  bitcoinWallet,
  bitcoinUTXOs,
  depositAmount,
  minerFee,
  assetFrom,
  assetTo,
  isDepositAll,
  signPsbt,
  updateTransactions,
  resetProvideAmountValue,
}: ConfirmDepositModalProps) {
  const solanaNetwork = usePersistentStore((state) => state.solanaNetwork);
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);

  const setIsGlobalLoaderOpen = useStore(
    (state) => state.setIsGlobalLoaderOpen
  );

  const zplClient = useZplClient();
  const networkConfig = useNetworkConfig();
  const { feeRate } = useTwoWayPegConfiguration();
  const [isDepositing, setIsDepositing] = useState(false);

  const handleConfirmDeposit = async () => {
    if (!zplClient || !solanaPubkey || !bitcoinWallet) return;

    if (!bitcoinUTXOs || bitcoinUTXOs.length === 0) {
      return;
    }

    setIsDepositing(true);
    setIsGlobalLoaderOpen(true);

    const userXOnlyPublicKey =
      getInternalXOnlyPubkeyFromUserWallet(bitcoinWallet);

    if (!userXOnlyPublicKey)
      throw new Error("User X Only Public Key not found");

    // although we have a array of hotReserveBuckets, but the user could only bind one bitcoin address with the protocol, so we only need to get the first one
    const hotReserveBuckets =
      await zplClient.getHotReserveBucketsByBitcoinXOnlyPubkey(
        userXOnlyPublicKey
      );

    if (!hotReserveBuckets || hotReserveBuckets.length === 0) {
      notifyError("No hot reserve address found");
      return;
    }

    // NOTE: Regtest and Testnet use the same ZPL with different guardian settings, so we need to set guardian setting in env
    const targetHotReserveBucket = hotReserveBuckets.find(
      (bucket) =>
        bucket.guardianSetting.toBase58() === networkConfig.guardianSetting
    );
    if (!targetHotReserveBucket) throw new Error("Wrong guardian setting");

    const { address: targetHotReserveAddress } = bitcoin.payments.p2tr({
      pubkey: Buffer.from(targetHotReserveBucket.taprootXOnlyPublicKey),
      network: convertBitcoinNetwork(bitcoinNetwork),
    });

    if (!targetHotReserveAddress) {
      notifyError("Hot reserve address not found");
      return;
    }

    let depositPsbt;
    let usedBitcoinUTXOs;
    try {
      const { psbt, usedUTXOs } = constructDepositToHotReserveTx(
        bitcoinUTXOs,
        targetHotReserveAddress,
        btcToSatoshi(depositAmount),
        userXOnlyPublicKey,
        feeRate,
        convertBitcoinNetwork(bitcoinNetwork),
        isDepositAll
      );
      depositPsbt = psbt;
      usedBitcoinUTXOs = usedUTXOs;
    } catch (e) {
      if (e instanceof Error && e.message === "Insufficient UTXO") {
        notifyError("Insufficient UTXO, please adjust the amount");
        return;
      } else {
        throw e;
      }
    }

    try {
      const signTx = await signPsbt(depositPsbt, true);

      const amount = depositPsbt.txOutputs[0].value;

      const { aresApi } = createAxiosInstances(solanaNetwork, bitcoinNetwork);

      const txId = await sendTransaction(aresApi, signTx);

      const createdAt = Math.floor(Date.now() / 1000);

      const transaction: Interaction = {
        status: InteractionStatus.BitcoinDepositToHotReserve,
        interaction_id: zplClient
          .deriveInteraction(Buffer.from(txId, "hex"), new BN(0))
          .toBase58(),
        interaction_type: InteractionType.Deposit,
        source: toXOnly(Buffer.from(bitcoinWallet.pubkey, "hex")).toString(
          "hex"
        ),
        destination: solanaPubkey.toBase58(),
        amount: amount.toString(),
        initiated_at: createdAt,
        current_step_at: createdAt,
        app_developer: "Orpheus",
        miner_fee: minerFee.toString(),
        service_fee: "0",
        steps: [
          {
            chain: Chain.Bitcoin,
            action: "DepositToHotReserve", // FIXME: might need to change to enum
            transaction: txId,
            timestamp: createdAt,
          },
        ],
      };

      await transactionRepo.addInteraction(
        bitcoinNetwork,
        solanaPubkey.toBase58(),
        transaction
      );

      await utxoRepo.addUTXOs(bitcoinWallet.p2tr, txId, usedBitcoinUTXOs);

      setTimeout(async () => {
        await updateTransactions();
        setIsDepositing(false);
        setIsGlobalLoaderOpen(false);
        resetProvideAmountValue();
        notifyTx(true, {
          chain: Chain.Bitcoin,
          txId,
          type: InteractionType.Deposit,
        });
        handleCloseModal();
      }, 2000);
    } catch (error) {
      console.error("ConfirmDeposit error", error);
      if (error instanceof Error) {
        const isAxiosError = error instanceof AxiosError;
        captureException(error, {
          extra: {
            detail: isAxiosError ? error?.response?.data?.error : error.message,
          },
        });
      }
      setIsGlobalLoaderOpen(false);
      setIsDepositing(false);
      notifyError("Deposit failed: Please try again later");
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={550}
      backdropType="overrideHeader"
      className="!px-16 !py-20"
    >
      <ModalHeader className="!top-24 right-16 z-10" onClose={onClose} />
      <div className="z-10 flex w-full flex-col gap-y-24 pt-24 sm:pt-0">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-x-12">
            <Icon
              name="Stake"
              size={18}
              className="text-apollo-brand-primary-blue"
            />
            <span className="body-body1-medium text-sys-color-text-primary">
              Confirm Deposit
            </span>
          </div>
        </div>

        {/* Asset */}
        <DepositAssetBanner assetFrom={assetFrom} assetTo={assetTo} />

        {/* Deposit Fee */}
        <div className="flex flex-col gap-y-12">
          <span className="body-body1-semibold text-sys-color-text-primary">
            Transaction Fee
          </span>
          <div className="body-body1-medium text-sys-color-text-primary flex flex-col gap-y-8">
            <div className="flex items-center justify-between">
              <span>Miner Fee</span>
              <span>
                {formatValue(
                  new BigNumber(minerFee).dividedBy(10 ** BTC_DECIMALS),
                  6
                )}{" "}
                BTC
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="rounded-12 bg-sys-color-background-card border-apollo-border-15 flex flex-col gap-y-4 border p-16">
          <div className="flex flex-col gap-y-8">
            <div className="flex items-center gap-x-8">
              <Icon
                name="Alert"
                size={18}
                className="text-sys-color-state-warning"
              />
              <span className="body-body1-medium text-sys-color-text-primary">
                Notice
              </span>
            </div>
            <span className="body-body1-medium text-sys-color-text-primary">
              Deposits may take up to 24 hours to complete based on Bitcoin
              network conditions.
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <ModalActions className="!pt-40">
        <Button
          type="secondary"
          size="large"
          className="w-full"
          label="Cancel"
          onClick={onClose}
        />
        <Button
          type="primary"
          size="large"
          className="w-full"
          label="Confirm"
          isLoading={isDepositing}
          onClick={() => {
            handleConfirmDeposit();
          }}
        />
      </ModalActions>
    </Modal>
  );
}

const DepositAssetBanner = ({
  assetFrom,
  assetTo,
}: {
  assetFrom: {
    name: string;
    amount: string;
    isLocked: boolean;
  };
  assetTo: {
    name: string;
    amount: string;
    isLocked: boolean;
  };
}) => {
  return (
    <div
      className={classNames(
        "gradient-border rounded-12 flex w-full flex-col gap-x-24 gap-y-16 bg-[linear-gradient(91deg,rgba(255,103,70,0.08)_0%,rgba(255,103,70,0.05)_30%,rgba(225,234,253,0.00)_45%,rgba(225,234,253,0.05)_60%,rgba(178,131,255,0.08)_70%,rgba(253,131,255,0.08)_100%)] sm:flex-row sm:items-center sm:justify-between sm:gap-y-0 sm:px-20 sm:py-16"
      )}
    >
      <div className="flex w-full flex-row justify-between gap-y-8 sm:w-auto sm:flex-col sm:justify-start">
        <span className="body-body2-medium text-sys-color-text-secondary">
          Lock
        </span>
        <div className="flex items-center gap-x-8">
          <Icon name={assetFrom.name.toLowerCase() as IconName} size={18} />
          <span className="body-body1-medium sm:headline-headline4 text-sys-color-text-primary">
            {assetFrom.amount}
            <span className="text-sys-color-text-secondary body-body1-medium sm:headline-headline6">
              {""} {assetFrom.name}
            </span>
          </span>
          {assetFrom.isLocked && (
            <Icon name="Lock" className="text-sys-color-text-secondary" />
          )}
        </div>
      </div>

      <Icon
        name="DoubleRight"
        className="text-sys-color-text-primary hidden flex-shrink-0 sm:block"
        size={24 as 18 | 14 | 12}
      />

      <div className="flex w-full flex-row items-center justify-between gap-y-8 sm:w-auto sm:flex-col sm:items-start sm:justify-start">
        <span className="body-body2-medium text-sys-color-text-secondary">
          Mint
        </span>
        <div className="flex items-center gap-x-8">
          <Icon name={assetTo.name.toLowerCase() as IconName} size={18} />
          <span className="body-body1-medium sm:headline-headline4 text-sys-color-text-primary">
            {assetTo.amount}
            <span className="text-sys-color-text-secondary body-body1-medium sm:headline-headline6">
              {""} {assetTo.name}
            </span>
          </span>
          {assetTo.isLocked && (
            <Icon name="Lock" className="text-sys-color-text-secondary" />
          )}
        </div>
      </div>
    </div>
  );
};
