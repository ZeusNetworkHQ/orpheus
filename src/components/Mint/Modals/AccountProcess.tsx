import { captureException } from "@sentry/nextjs";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import Button from "@/components/Button/Button";
import Icon from "@/components/Icons";
import Modal, { ModalActions } from "@/components/ShadcnModal/Modal";
import { ModalHeader } from "@/components/ShadcnModal/Modal";
import { BitcoinWallet } from "@/types/wallet";
import { shortenString } from "@/utils/format";
import { notifyError } from "@/utils/notification";

export interface AccountProcessProps {
  isOpen: boolean;
  onClose: () => void;
  type: "creation" | "renew" | null;
  createHotReserveBucket: () => Promise<void>;
  reactivateHotReserveBucket: () => Promise<void>;
  openConfirmDepositModal: () => void;
  updateBitcoinUTXOs: () => Promise<void>;
  solanaPubkey: PublicKey | null;
  bitcoinWallet: BitcoinWallet | null;
  depositAmount: number;
}

export default function AccountProcess({
  isOpen,
  onClose,
  type,
  createHotReserveBucket,
  reactivateHotReserveBucket,
  openConfirmDepositModal,
  updateBitcoinUTXOs,
  solanaPubkey,
  bitcoinWallet,
}: AccountProcessProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal
      width={360}
      isOpen={isOpen}
      onClose={onClose}
      backdropType="overrideHeader"
      className="!rounded-20 !pb-12 !pt-20"
    >
      <ModalHeader
        onClose={onClose}
        className="absolute !top-20 right-16 z-10"
      />
      <div className="flex flex-col gap-y-24">
        <div className=" flex w-full flex-col gap-y-16">
          <span className="body-body1-medium text-sys-color-text-primary !pt-24 sm:!pt-0">
            {type === "creation"
              ? "Account Creation Required"
              : "Renew Bitcoin Account"}
          </span>

          {type === "creation" ? (
            <span className="body-body2-medium text-sys-color-text-mute text-pretty">
              To proceed with your first deposit, a new account must be created.
              This process requires a one-time fee of{" "}
              <span className="text-sys-color-text-primary">0.05 SOL</span>.
            </span>
          ) : (
            <span className="body-body2-medium text-sys-color-text-mute text-pretty">
              You need to reactivate to continue using this Bitcoin Account.
              This process requires a one-time fee of{" "}
              <span className="text-sys-color-text-primary">0.01 SOL</span>.
            </span>
          )}

          <div className="relative z-20 flex flex-col gap-y-8">
            <div className="bg-sys-color-background-light border-apollo-border-15 rounded-16 p-apollo-10 flex items-center justify-between border">
              <div className="flex items-center gap-x-12">
                <Icon name="solana" size={18} />
                <span className="body-body1-medium text-sys-color-text-primary">
                  Solana
                </span>
              </div>
              <Button
                type="secondary"
                label={shortenString(solanaPubkey?.toBase58() ?? "-", 6)}
                className="!w-max"
                size="small"
              />
            </div>

            <div className="rounded-12 bg-sys-color-background-light border-apollo-border-15 absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center border">
              {type === "creation" ? (
                <Icon
                  name="Link"
                  size={18}
                  className="text-sys-color-text-secondary"
                />
              ) : (
                <Icon
                  name="Alert"
                  size={18}
                  className="text-sys-color-state-warning"
                />
              )}
            </div>

            <div className="bg-sys-color-background-light border-apollo-border-15 rounded-16 p-apollo-10 flex items-center justify-between border">
              <div className="flex items-center gap-x-12">
                <Icon name="btc" size={18} />
                <span className="body-body1-medium text-sys-color-text-primary">
                  Bitcoin
                </span>
              </div>
              <Button
                type="secondary"
                label={shortenString(bitcoinWallet?.p2tr ?? "-", 6)}
                className="!w-max"
                size="small"
              />
            </div>
          </div>
        </div>

        <ModalActions>
          <Button
            className="!w-full"
            type="secondary"
            label="Cancel"
            onClick={onClose}
          />
          <Button
            className="!w-full"
            type="primary"
            label={type === "creation" ? "Continue" : "Reactivate"}
            isLoading={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                if (type === "creation") {
                  await createHotReserveBucket();
                } else {
                  await reactivateHotReserveBucket();
                }
                await updateBitcoinUTXOs();
                onClose();
                openConfirmDepositModal();
              } catch (e) {
                console.error(e);
                captureException(e);
                notifyError(
                  type === "creation"
                    ? "Failed to Create Account"
                    : "Failed to Renew Account"
                );
              } finally {
                setIsLoading(false);
              }
            }}
          />
        </ModalActions>
      </div>
    </Modal>
  );
}
