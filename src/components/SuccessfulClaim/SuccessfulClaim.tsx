"use client";

import Image from "next/image";
import Link from "next/link";

import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";

import Icon from "../Icons";
import Modal from "../Modal/Modal";
import Button from "../WalletButton/Button";

import styles from "./styles.module.scss";

export default function SuccessfulClaim({
  claimedAmount,
}: {
  claimedAmount: number;
}) {
  const currentModal = useStore((state) => state.currentModal);
  const closeModal = useStore((state) => state.closeModal);

  return (
    <Modal
      width="450px"
      isOpen={currentModal === MODAL_NAMES.SUCCESSFUL_CLAIM}
      isDrawer={false}
      isCentered={true}
      onClose={closeModal}
      animateFrom={null}
      fixedBackdrop
    >
      <div className={styles.successfulClaim__close} onClick={closeModal}>
        <Icon name="Close" />
      </div>
      <div className={styles.successfulClaim}>
        <div className={styles.successfulClaim__title}>
          You successfully claimed
        </div>
        <div className={styles.successfulClaim__subtitle}>
          <Image src="/icons/tbtc.svg" width={24} height={24} alt="tBTC" />
          <div className={styles.successfulClaim__subtitle__value}>
            {claimedAmount} <span>tBTC</span>
          </div>
        </div>
        <div className={styles.successfulClaim__footer}>
          <Link href="/">
            <Button
              label="Try out Staking"
              theme="primary"
              size="lg"
              classes="!w-full !mt-6"
              icon={<Icon name="Provide" />}
            ></Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
