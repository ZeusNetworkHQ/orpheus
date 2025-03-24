import { PublicKey } from "@solana/web3.js";
import { Psbt } from "bitcoinjs-lib";
import { useState } from "react";

import { btcToSatoshi, satoshiToBtc } from "@/bitcoin";
import { estimateMaxSpendableAmount } from "@/bitcoin";
import Icon from "@/components/Icons";
import { DepositTooltip } from "@/components/Mint/DepositTooltip/DepositTooltip";
import AccountProcess from "@/components/Mint/Modals/AccountProcess";
import ConfirmDepositModal from "@/components/Mint/Modals/ConfirmDeposit";
import useBitcoinUTXOs from "@/hooks/ares/useBitcoinUTXOs";
import useHotReserveBucketActions from "@/hooks/zpl/useHotReserveBucketActions";
import useTwoWayPegConfiguration from "@/hooks/zpl/useTwoWayPegConfiguration";
import { UTXOs } from "@/types/api";
import { CheckBucketResult } from "@/types/misc";
import { BitcoinWallet } from "@/types/wallet";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";
import { getEstimatedLockToColdTransactionFee } from "@/utils/interaction";
import { notifyError } from "@/utils/notification";

import CryptoInput from "../../CryptoInput/CryptoInput";
import Button from "../../WalletButton/Button";

import styles from "./styles.module.scss";

type DepositProps = {
  solanaPubkey: PublicKey | null;
  bitcoinWallet: BitcoinWallet | null;
  signPsbt: (psbt: Psbt, tweaked?: boolean) => Promise<string>;
  updateDepositTransactions: () => Promise<void>;
  isAllConnected: boolean;
  btcPrice: number;
  cachedUtxos: UTXOs;
};

export default function Deposit({
  solanaPubkey,
  bitcoinWallet,
  signPsbt,
  updateDepositTransactions,
  isAllConnected,
  btcPrice,
  cachedUtxos,
}: DepositProps) {
  const { feeRate } = useTwoWayPegConfiguration();
  const {
    checkHotReserveBucketStatus,
    createHotReserveBucket,
    reactivateHotReserveBucket,
  } = useHotReserveBucketActions(bitcoinWallet);
  const { data: bitcoinUTXOs, mutate: mutateBitcoinUTXOs } = useBitcoinUTXOs(
    bitcoinWallet?.p2tr
  );

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [provideAmountValue, setProvideAmountValue] = useState("");
  const [prevConnected, setPrevConnected] = useState(isAllConnected);
  const [isDepositing, setIsDepositing] = useState(false);
  const [accountProcessModalType, setAccountProcessModalType] = useState<
    "creation" | "renew" | null
  >(null);
  const [isConfirmDepositModalOpen, setIsConfirmDepositModalOpen] =
    useState(false);
  const [isBalanceTooltipOpen, setIsBalanceTooltipOpen] = useState(false);

  const unavailableUTXOs = bitcoinUTXOs?.filter((utxo) =>
    cachedUtxos.some(
      (cachedUtxo) =>
        cachedUtxo.transaction_id === utxo.transaction_id &&
        cachedUtxo.transaction_index === utxo.transaction_index
    )
  );
  const availableUTXOs = bitcoinUTXOs?.filter(
    (utxo) =>
      !unavailableUTXOs.some(
        (unavailableUtxo) =>
          unavailableUtxo.transaction_id === utxo.transaction_id &&
          unavailableUtxo.transaction_index === utxo.transaction_index
      )
  );

  const estimatedLockToColdFeeInSatoshis =
    getEstimatedLockToColdTransactionFee(feeRate);

  const estimatedLockToColdFeeInBtc = satoshiToBtc(
    estimatedLockToColdFeeInSatoshis
  );

  const provideAmount = parseFloat(provideAmountValue) || 0;

  const provideValue =
    btcPrice && provideAmount
      ? formatValue(provideAmount * btcPrice)
      : formatValue(0);

  const estimateReceivedAmount = provideAmount
    ? provideAmount - estimatedLockToColdFeeInBtc
    : 0;

  const estimateReceivedValue =
    btcPrice && estimateReceivedAmount
      ? formatValue(estimateReceivedAmount * btcPrice)
      : formatValue(0);

  const maxSpendableSatoshis = availableUTXOs
    ? estimateMaxSpendableAmount(availableUTXOs, feeRate)
    : 0;

  const totalSatoshis =
    bitcoinUTXOs?.reduce((acc, utxo) => acc + utxo.satoshis, 0) ?? 0;
  const availableSatoshis =
    availableUTXOs?.reduce((acc, utxo) => acc + utxo.satoshis, 0) ?? 0;
  const unavailableSatoshis =
    unavailableUTXOs?.reduce((acc, utxo) => acc + utxo.satoshis, 0) ?? 0;

  const handleErrorMessage = (message: string) => {
    setErrorMessage(message);
  };

  const openConfirmDepositModal = () => {
    setIsConfirmDepositModalOpen(true);
  };

  const updateBitcoinUTXOs = async () => {
    await mutateBitcoinUTXOs();
    await updateDepositTransactions();
  };

  const resetProvideAmountValue = () => {
    setProvideAmountValue("");
    setErrorMessage("");
  };

  if (isAllConnected !== prevConnected) {
    setPrevConnected(isAllConnected);
    resetProvideAmountValue();
  }

  return (
    <>
      <div className={`${styles.mintWidget__card__actions}`}>
        <div className={`${styles.mintWidget__card__actions__item} ds`}>
          <div className={styles.mintWidget__card__actions__item__title}>
            <span>Lock</span>
            {!isAllConnected ? (
              <div
                className={
                  styles.mintWidget__card__actions__item__footer__message
                }
              >
                <Icon name="WalletSmall" />
                <span>Connect Bitcoin Wallet</span>
              </div>
            ) : (
              <div
                className={`
                    ${styles.mintWidget__card__actions__item__footer__message} relative cursor-pointer`}
                onMouseEnter={() => setIsBalanceTooltipOpen(true)}
                onMouseLeave={() => setIsBalanceTooltipOpen(false)}
              >
                <DepositTooltip
                  totalBalance={totalSatoshis}
                  availableUtxoAmount={availableSatoshis}
                  unavailableUtxoAmount={unavailableSatoshis}
                  isOpen={isBalanceTooltipOpen}
                />
                <Icon name="WalletSmall" />
                <span className="text-shade-primary">
                  {formatValue(availableSatoshis / 10 ** BTC_DECIMALS, 6)}
                  <span className="text-shade-mute">Available tBTC</span>
                </span>
              </div>
            )}
          </div>

          <CryptoInput
            isDisabled={!isAllConnected}
            min={0.0001}
            max={satoshiToBtc(maxSpendableSatoshis)}
            setAmount={setProvideAmountValue}
            errorMessage={errorMessage}
            value={provideAmountValue}
            isInvalid={!!errorMessage}
            handleErrorMessage={handleErrorMessage}
            fiatValue={provideValue}
            hasActions
            currentOption={{
              label: "tBTC",
              type: null,
            }}
          />
        </div>

        <div className={`${styles.mintWidget__card__actions__item}`}>
          <div className={styles.mintWidget__card__actions__item__title}>
            Mint
          </div>
          <CryptoInput
            isDisabled={true}
            placeholder={estimateReceivedAmount}
            setAmount={setProvideAmountValue}
            fiatValue={estimateReceivedValue}
            currentOption={{ label: "zBTC", type: "Custodial" }}
          />
        </div>

        <Button
          icon={!isAllConnected && <Icon name="Wallet" />}
          theme="primary"
          label="Deposit"
          size="lg"
          classes="!mt-8"
          isLoading={isDepositing}
          disabled={isAllConnected && (provideAmount === 0 || !!errorMessage)}
          onClick={async () => {
            setIsDepositing(true);
            try {
              const result = await checkHotReserveBucketStatus();
              if (result?.status === CheckBucketResult.NotFound) {
                setAccountProcessModalType("creation");
              } else if (
                result?.status === CheckBucketResult.Expired ||
                result?.status === CheckBucketResult.Deactivated
              ) {
                setAccountProcessModalType("renew");
              } else {
                await updateBitcoinUTXOs();
                openConfirmDepositModal();
              }
            } catch {
              notifyError("Failed to Deposit");
            } finally {
              setIsDepositing(false);
            }
          }}
          solanaWalletRequired={true}
          bitcoinWalletRequired={true}
        />
      </div>

      <AccountProcess
        isOpen={accountProcessModalType !== null}
        onClose={() => setAccountProcessModalType(null)}
        type={accountProcessModalType}
        createHotReserveBucket={createHotReserveBucket}
        reactivateHotReserveBucket={reactivateHotReserveBucket}
        openConfirmDepositModal={openConfirmDepositModal}
        updateBitcoinUTXOs={updateBitcoinUTXOs}
        solanaPubkey={solanaPubkey}
        bitcoinWallet={bitcoinWallet}
        depositAmount={provideAmount}
      />

      <ConfirmDepositModal
        isOpen={isConfirmDepositModalOpen}
        onClose={() => setIsConfirmDepositModalOpen(false)}
        solanaPubkey={solanaPubkey}
        bitcoinWallet={bitcoinWallet}
        bitcoinUTXOs={availableUTXOs}
        depositAmount={provideAmount}
        minerFee={estimatedLockToColdFeeInSatoshis}
        assetFrom={{
          amount: provideAmountValue,
          name: "BTC",
          isLocked: false,
        }}
        assetTo={{
          amount: formatValue(provideAmount - estimatedLockToColdFeeInBtc, 6),
          name: "zBTC",
          isLocked: true,
        }}
        isDepositAll={btcToSatoshi(provideAmount) === maxSpendableSatoshis}
        signPsbt={signPsbt}
        updateTransactions={updateDepositTransactions}
        resetProvideAmountValue={resetProvideAmountValue}
      />
    </>
  );
}
