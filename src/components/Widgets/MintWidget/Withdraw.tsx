import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { useState } from "react";

import { xOnlyPubkeyHexToP2tr } from "@/bitcoin";
import Icon from "@/components/Icons";
import { IconName } from "@/components/Icons/icons";
import ConfirmWithdraw from "@/components/Mint/Modals/ConfirmWithdraw";
import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import useHotReserveBucketsByOwner from "@/hooks/zpl/useHotReserveBucketsByOwner";
import useTwoWayPegConfiguration from "@/hooks/zpl/useTwoWayPegConfiguration";
import usePersistentStore from "@/stores/persistentStore";
import useStore from "@/stores/store";
import { CryptoInputOption } from "@/types/misc";
import { Position } from "@/types/zplClient";
import {
  DEFAULT_SERVICE_FEE_BASIS_POINT_PERCENT,
  BTC_DECIMALS,
  DEFAULT_LAYER_FEE,
  MODAL_NAMES,
} from "@/utils/constant";
import { formatValue } from "@/utils/format";
import { getEstimatedWithdrawalTransactionFee } from "@/utils/interaction";

import CryptoInput from "../../CryptoInput/CryptoInput";
import Button from "../../WalletButton/Button";

import styles from "./styles.module.scss";

type WithdrawProps = {
  solanaPubkey: PublicKey | null;
  solanaWalletConnected: boolean;
  positions: Position[];
  btcPrice: number;
  zbtcBalance: BigNumber;
  updateTransactions: () => Promise<void>;
  updateZbtcBalance: () => Promise<void>;
};

export default function Withdraw({
  solanaPubkey,
  solanaWalletConnected,
  positions,
  btcPrice,
  zbtcBalance,
  updateTransactions,
  updateZbtcBalance,
}: WithdrawProps) {
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const openModalByName = useStore((state) => state.openModalByName);

  const { wallet: bitcoinWallet } = useBitcoinWallet();
  const { feeRate } = useTwoWayPegConfiguration();
  const { data: hotReserveBuckets } = useHotReserveBucketsByOwner(solanaPubkey);

  const zbtcBalanceInVault =
    positions?.reduce(
      (acc, cur) =>
        acc
          .plus(cur.storedAmount.toString())
          .minus(cur.frozenAmount.toString()),
      new BigNumber(0)
    ) ?? new BigNumber(0);

  const [currentOption, setCurrentOption] = useState<CryptoInputOption>(
    zbtcBalanceInVault?.gt(zbtcBalance)
      ? {
          label: "zBTC",
          type: "Custodial",
          icon: "Lock",
        }
      : {
          label: "zBTC",
          type: null,
        }
  );
  const [prevConnected, setPrevConnected] = useState(solanaWalletConnected);
  const [provideAmountValue, setProvideAmountValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const walletsInHotReserveBuckets = hotReserveBuckets.map((bucket) =>
    xOnlyPubkeyHexToP2tr(
      Buffer.from(bucket.scriptPathSpendPublicKey).toString("hex"),
      bitcoinNetwork,
      "internal"
    )
  );
  const connectedWallets = bitcoinWallet?.p2tr
    ? Array.from(new Set([bitcoinWallet.p2tr, ...walletsInHotReserveBuckets]))
    : Array.from(new Set(walletsInHotReserveBuckets));

  const provideAmount = parseFloat(provideAmountValue) || 0;
  const estimatedWithdrawTransactionFeeInSatoshis =
    getEstimatedWithdrawalTransactionFee(feeRate);
  const estimatedWithdrawTransactionFeeInBtc =
    estimatedWithdrawTransactionFeeInSatoshis / 10 ** BTC_DECIMALS;

  const estimateServiceFee =
    DEFAULT_SERVICE_FEE_BASIS_POINT_PERCENT * provideAmount;

  const estimateReceiveAmount = provideAmount
    ? provideAmount - estimatedWithdrawTransactionFeeInBtc - estimateServiceFee
    : 0;

  const estimateReceiveBtcValue =
    btcPrice && estimateReceiveAmount
      ? formatValue(estimateReceiveAmount * btcPrice, 2)
      : formatValue(0);

  const btcValue =
    btcPrice && provideAmount
      ? formatValue(provideAmount * btcPrice, 2)
      : formatValue(0);

  const dropdownOptions: CryptoInputOption[] = [
    {
      label: "zBTC",
      type: "Custodial",
      amount: zbtcBalanceInVault?.div(10 ** BTC_DECIMALS).toNumber(),
      value: formatValue(
        zbtcBalanceInVault?.div(10 ** BTC_DECIMALS).multipliedBy(btcPrice),
        2
      ),
      icon: "Lock",
    },
    {
      label: "zBTC",
      type: null,
      amount: zbtcBalance?.div(10 ** BTC_DECIMALS).toNumber(),
    },
  ];

  const currentBalance = dropdownOptions.find((option) => {
    return (
      option.label === currentOption.label && option.type === currentOption.type
    );
  })?.amount;

  const changeOption = (option: CryptoInputOption) => {
    setCurrentOption(option);
    setProvideAmountValue("");
    setErrorMessage("");
  };

  const handleErrorMessage = (message: string) => {
    setErrorMessage(message);
  };

  const resetInput = () => {
    setProvideAmountValue("");
    setErrorMessage("");
  };

  if (solanaWalletConnected !== prevConnected) {
    setPrevConnected(solanaWalletConnected);
    resetInput();
  }

  return (
    <>
      <div className={`${styles.mintWidget__card__actions}`}>
        <div className={styles.mintWidget__card__actions__item}>
          <div className={styles.mintWidget__card__actions__item__title}>
            <span>Burn</span>
            {!solanaWalletConnected ? (
              <div
                className={
                  styles.mintWidget__card__actions__item__footer__message
                }
              >
                <Icon name="WalletSmall" />
                <span>Connect Wallet</span>
              </div>
            ) : (
              <div
                className={
                  styles.mintWidget__card__actions__item__footer__message
                }
              >
                <Icon name="WalletSmall" />
                <span className="text-shade-primary">
                  {currentBalance ? formatValue(currentBalance, 6) : "0"}
                  <span className="text-shade-mute">
                    {""} {currentOption.label}
                  </span>
                </span>
                {currentOption.icon && (
                  <Icon name={currentOption.icon as IconName} size={14} />
                )}
              </div>
            )}
          </div>

          <CryptoInput
            isDisabled={solanaWalletConnected ? false : true}
            min={0.0001}
            max={currentBalance ?? 0}
            setAmount={setProvideAmountValue}
            errorMessage={errorMessage}
            value={provideAmountValue}
            isInvalid={!!errorMessage}
            handleErrorMessage={handleErrorMessage}
            fiatValue={btcValue}
            hasActions
            dropdownOptions={dropdownOptions}
            currentOption={currentOption}
            changeOption={changeOption}
          />
        </div>
        <div className={`${styles.mintWidget__card__actions__item}`}>
          <div className={styles.mintWidget__card__actions__item__title}>
            Unlock
          </div>
          <CryptoInput
            isDisabled={true}
            placeholder={estimateReceiveAmount}
            setAmount={setProvideAmountValue}
            fiatValue={estimateReceiveBtcValue}
            currentOption={{
              label: "tBTC",
              type: null,
            }}
          />
        </div>
        <Button
          icon={!solanaWalletConnected && <Icon name="Wallet" />}
          theme="primary"
          label={"Withdraw"}
          size="lg"
          classes="!mt-8"
          disabled={provideAmount === 0 || !!errorMessage}
          onClick={() => {
            if (connectedWallets.length > 0) {
              setIsWithdrawModalOpen(true);
            } else {
              openModalByName(MODAL_NAMES.ADD_NEW_WALLET);
            }
          }}
          solanaWalletRequired={true}
        />
        <div className="flex justify-center space-x-2 py-2 text-center text-primary-apollo sm:items-center">
          <Icon name="Alert" />
          <span className="-mt-1 font-medium text-shade-secondary sm:mt-0">
            The withdrawal process takes about 24 hours
          </span>
        </div>
      </div>

      {connectedWallets.length > 0 && (
        <ConfirmWithdraw
          isOpen={isWithdrawModalOpen}
          onClose={() => {
            setIsWithdrawModalOpen(false);
          }}
          solanaPubkey={solanaPubkey}
          withdrawAmount={provideAmount}
          assetFrom={{
            name: "zBTC",
            amount: formatValue(provideAmount, 6),
            isLocked: currentOption.type === "Custodial",
          }}
          assetTo={{
            name: "BTC",
            amount: formatValue(estimateReceiveAmount, 6),
            isLocked: false,
          }}
          positions={positions}
          connectedWallets={connectedWallets}
          serviceFee={formatValue(estimateServiceFee, 6)}
          minerFee={formatValue(
            estimatedWithdrawTransactionFeeInBtc,
            8
          ).replace(/\.?0+$/, "")}
          layerFee={formatValue(DEFAULT_LAYER_FEE, 2)}
          updateTransactions={updateTransactions}
          updateZbtcBalance={updateZbtcBalance}
          resetInput={resetInput}
        />
      )}
    </>
  );
}
