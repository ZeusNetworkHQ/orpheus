import { captureException } from "@sentry/nextjs";
import {
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { WalletSignTransactionError } from "@solana/wallet-adapter-base";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { BN } from "bn.js";
import { useState } from "react";

import Button from "@/components/Button/Button";
import Icon from "@/components/Icons";
import { ModalActions, ModalHeader } from "@/components/ShadcnModal/Modal";
import Modal from "@/components/ShadcnModal/Modal";
import TextField from "@/components/TextField/TextField";
import { useZplClient } from "@/contexts/ZplClientProvider";
import useBalance from "@/hooks/misc/useBalance";
import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import usePositions from "@/hooks/zpl/usePositions";
import usePersistentStore from "@/stores/persistentStore";
import { Chain } from "@/types/network";
import { Position } from "@/types/zplClient";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";
import { notifyError, notifyTx } from "@/utils/notification";

function calcInputValue(inputValue: string, decimals: number) {
  // Handle multiple decimal points
  const parts = inputValue.split(".");
  if (parts.length > 2) {
    inputValue = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal
  if (parts.length === 2 && parts[1].length > decimals) {
    inputValue = parts[0] + "." + parts[1].slice(0, 6);
  }

  return inputValue;
}

export interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  btcPrice: number;
  positions: Position[] | undefined;
  balance: number;
  min?: number;
  max?: number;
}

export default function RedeemModal({
  isOpen,
  onClose,
  btcPrice,
  positions,
  balance,
  min,
  max,
}: RedeemModalProps) {
  const solanaNetwork = usePersistentStore((state) => state.solanaNetwork);
  const config = useNetworkConfig();
  const zplClient = useZplClient();
  const { publicKey: solanaPubkey } = useWallet();
  const { mutate: mutateBalance } = useBalance(solanaPubkey);
  const { mutate: mutatePositions } = usePositions(solanaPubkey);
  const { connection } = useConnection();

  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleErrorMessage = (message: string) => {
    setErrorMessage(message);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    decimals: number
  ) => {
    let inputValue = e.target.value;

    // Only allow non-negative numbers and decimal points
    if (/^\d*\.?\d*$/.test(inputValue)) {
      // Handle the case where the decimal point starts with "." (e.g. ".5")
      if (inputValue.startsWith(".")) {
        inputValue = "0" + inputValue;
      }

      inputValue = calcInputValue(inputValue, decimals);

      if (parseFloat(inputValue) === 0) {
        handleErrorMessage?.("Invalid amount");
      } else if (max !== undefined && parseFloat(inputValue) > max) {
        handleErrorMessage?.("Value exceeds your balance");
      } else if (min !== undefined && parseFloat(inputValue) < min) {
        handleErrorMessage?.(`Value must be greater than ${min}`);
      } else {
        handleErrorMessage?.("");
      }

      setRedeemAmount?.(inputValue);
    }
  };

  const handleMax = () => {
    if (!max) return;
    handleErrorMessage?.("");

    const inputValue = calcInputValue(max.toString(), BTC_DECIMALS);
    const val = Number(inputValue);
    setRedeemAmount?.(formatValue(val, BTC_DECIMALS));
  };

  const handleRedeem = async () => {
    if (!redeemAmount || !zplClient || !solanaPubkey) return;
    setIsRedeeming(true);

    try {
      if (!positions) return;

      const sortedPositions = positions.toSorted((a, b) =>
        b.storedAmount
          .sub(b.frozenAmount)
          .cmp(a.storedAmount.sub(a.frozenAmount))
      );

      const redeemAmountBN = new BN(
        new BigNumber(redeemAmount)
          .multipliedBy(new BigNumber(10).pow(BTC_DECIMALS))
          .toString()
      );

      const ixs: TransactionInstruction[] = [];

      let remainingAmount = redeemAmountBN.clone();
      for (const position of sortedPositions) {
        const amountToRedeem = BN.min(
          position.storedAmount.sub(position.frozenAmount),
          remainingAmount
        );

        const twoWayPegGuardianSetting = config.guardianSetting;

        if (!twoWayPegGuardianSetting)
          throw new Error("Two way peg guardian setting not found");

        const receiverAta = getAssociatedTokenAddressSync(
          new PublicKey(config.assetMint),
          solanaPubkey,
          true
        );

        const retrieveIx = zplClient.constructRetrieveIx(
          amountToRedeem,
          new PublicKey(twoWayPegGuardianSetting),
          receiverAta
        );
        ixs.push(retrieveIx);

        // TODO: You can customize the retrieve address here
        if (process.env.NEXT_PUBLIC_DEVNET_REDEEM_ADDRESS) {
          const targetAddress = new PublicKey(
            process.env.NEXT_PUBLIC_DEVNET_REDEEM_ADDRESS
          );
          const toATA = getAssociatedTokenAddressSync(
            new PublicKey(config.assetMint),
            targetAddress,
            true
          );
          // check if the target address has an associated token account
          const info = await connection.getAccountInfo(toATA);
          if (!info) {
            // if not, create one
            const createIx = createAssociatedTokenAccountInstruction(
              solanaPubkey,
              toATA,
              targetAddress,
              new PublicKey(config.assetMint)
            );
            ixs.push(createIx);
          }
          // add a transfer instruction to transfer the tokens to the receive_address
          const transferIx = createTransferInstruction(
            receiverAta,
            toATA,
            solanaPubkey,
            BigInt(amountToRedeem.toString())
          );
          ixs.push(transferIx);
        }

        remainingAmount = remainingAmount.sub(amountToRedeem);

        if (remainingAmount.eq(new BN(0))) break;
      }

      const sig = await zplClient.signAndSendTransactionWithInstructions(ixs);

      await mutateBalance();
      await mutatePositions();
      setRedeemAmount("");
      onClose();
      notifyTx(true, {
        chain: Chain.Solana,
        txId: sig,
        solanaNetwork,
      });
    } catch (error) {
      if (error instanceof WalletSignTransactionError) {
        notifyError("Sign transaction error");
      } else {
        notifyError("Error in redeeming, please try again");
        captureException(error);
        console.error("Error in redeeming", error);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={485}
      backdropType="overrideHeader"
      className="!px-16 !py-20"
    >
      <ModalHeader className="!top-24 right-16 z-10" onClose={onClose} />
      <div className="flex w-full flex-col gap-y-24">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-x-12">
            <Icon
              name="Withdraw01"
              size={18}
              className="text-apollo-brand-primary-blue"
            />
            <span className="body-body1-medium text-sys-color-text-secondary">
              Redeem zBTC
            </span>
          </div>
        </div>

        <div className="z-10 flex w-full items-center">
          <TextField
            type="amount"
            actionLabel="Max"
            placeholder={formatValue(0, BTC_DECIMALS)}
            invalid={!!errorMessage}
            invalidMessage={errorMessage}
            value={redeemAmount}
            secondaryValue={`~$${
              Number(redeemAmount) > 0
                ? formatValue(Number(redeemAmount) * btcPrice, 2)
                : 0
            }`}
            onActionClick={handleMax}
            handleValueChange={(e) => handleChange(e, BTC_DECIMALS)}
            showBalance={true}
            balanceValue={balance.toLocaleString()}
            showLockIcon={true}
            label="You Redeem"
          >
            <div className="border-apollo-border-15 rounded-8 bg-sys-color-background-card w-[150px] flex-shrink-0 border px-12 py-16 shadow-[inset_0px_2px_2px_rgba(139,138,158,0.1)]">
              <div className="flex h-full w-full items-center space-x-8">
                <Icon name={"zbtc"} size={18} />
                <div className="flex flex-col">
                  <div className="flex items-center space-x-4">
                    <p className="headline-headline6 text-sys-color-text-primary">
                      zBTC
                    </p>
                    <Icon
                      className="text-sys-color-text-secondary"
                      name="Lock"
                      size={14}
                    />
                  </div>
                  <span className="body-body2-medium text-sys-color-text-mute leading-none">
                    Custodial
                  </span>
                </div>
              </div>
            </div>
          </TextField>
        </div>

        <div className="flex flex-col gap-y-8">
          <div className="flex items-center justify-between">
            <span className="body-body1-medium text-sys-color-text-secondary">
              Available In
            </span>
            <span className="body-body1-medium text-sys-color-text-secondary">
              ~ 1 minute
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="body-body1-medium text-sys-color-text-secondary">
              Remaining zBTC
            </span>
            <div className="body-body1-medium text-sys-color-text-secondary flex items-center gap-x-4">
              {formatValue(Math.max(balance - Number(redeemAmount), 0), 6)} zBTC
              <Icon
                name="Lock"
                size={18}
                className="text-sys-color-text-secondary"
              />
            </div>
          </div>
        </div>

        <ModalActions>
          <Button
            type="primary"
            size="large"
            label="Redeem"
            isLoading={isRedeeming}
            disabled={!!errorMessage || !redeemAmount}
            onClick={handleRedeem}
          />
        </ModalActions>
      </div>
    </Modal>
  );
}
