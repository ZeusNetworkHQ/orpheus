import { PublicKey } from "@solana/web3.js";
import { Psbt } from "bitcoinjs-lib";
import { useState } from "react";

import useBitcoinUTXOs from "@/hooks/useBitcoinUTXOs";
import useHotReserveBucketActions from "@/hooks/useHotReserveBucketActions";
import useTwoWayPegConfiguration from "@/hooks/useTwoWayPegConfiguration";
import { DepositTooltip } from "@/new-components/Mint/DepositTooltip/DepositTooltip";
import AccountProcess from "@/new-components/Mint/Modals/AccountProcess";
import ConfirmDepositModal from "@/new-components/Mint/Modals/ConfirmDeposit";
import { UTXOs } from "@/types/api";
import { CheckBucketResult } from "@/types/misc";
import { BitcoinWallet } from "@/types/wallet";
import { BTC_DECIMALS } from "@/utils/constant";
import { estimateMaxSpendableAmount } from "@/utils/deposit";
import { formatValue } from "@/utils/format";
import { btcToSatoshi, satoshiToBtc } from "@/utils/hotReserveBucket";
import { notifyError } from "@/utils/notifies";
import { getEstimatedDepositTransactionFee } from "@/utils/transaction";

import Button from "../../Button/Button";
import CryptoInput from "../../CryptoInput/CryptoInput";
import Wallet from "../../Icons/Wallet";
import WalletSmallIcon from "../../Icons/WalletSmall";

import styles from "./styles.module.scss";

type DepositProps = {
  solanaPubkey: PublicKey | null;
  bitcoinWallet: BitcoinWallet | null;
  signPsbt: (psbt: Psbt, tweaked?: boolean) => Promise<string>;
  updateDepositTransactions: () => Promise<void>;
  isAllConnected: boolean;
  btcPrice: number;
  cachedUtxos: UTXOs;
  switchToWithdrawTab: () => void;
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

  const estimatedDepositFeeInSatoshis =
    getEstimatedDepositTransactionFee(feeRate);

  const estimatedDepositFeeInBtc = satoshiToBtc(estimatedDepositFeeInSatoshis);

  const provideAmount = parseFloat(provideAmountValue) || 0;

  const estimateDepositAmount = provideAmount
    ? provideAmount - estimatedDepositFeeInBtc
    : 0;

  const estimateDepositBtcValue =
    btcPrice && estimateDepositAmount
      ? formatValue(estimateDepositAmount * btcPrice)
      : formatValue(0);

  const btcValue =
    btcPrice && provideAmount
      ? formatValue(provideAmount * btcPrice)
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
                <WalletSmallIcon />
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
                <WalletSmallIcon />
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
            max={maxSpendableSatoshis}
            setAmount={setProvideAmountValue}
            errorMessage={errorMessage}
            value={provideAmountValue}
            isInvalid={!!errorMessage}
            handleErrorMessage={handleErrorMessage}
            fiatValue={btcValue}
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
            placeholder={estimateDepositAmount}
            setAmount={setProvideAmountValue}
            fiatValue={estimateDepositBtcValue}
            currentOption={{ label: "zBTC", type: "Custodial" }}
          />
        </div>

        <Button
          icon={!isAllConnected && <Wallet />}
          theme="primary"
          label="Deposit"
          size="lg"
          classes="!mt-8"
          isLoading={isDepositing}
          disabled={isAllConnected && provideAmount === 0}
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
        minerFee={estimatedDepositFeeInSatoshis}
        assetFrom={{
          amount: provideAmountValue,
          name: "BTC",
          isLocked: false,
        }}
        assetTo={{
          amount: formatValue(provideAmount - estimatedDepositFeeInBtc, 6),
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
