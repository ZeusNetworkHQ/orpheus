import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";

import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import { cn } from "@/utils/misc";

import styles from "../styles.module.scss";

export default function CardAlertList() {
  const { connected: solanaWalletConnected } = useWallet();
  const { connected: bitcoinWalletConnected } = useBitcoinWallet();

  const isAllConnected = bitcoinWalletConnected && solanaWalletConnected;

  if (isAllConnected) {
    return (
      <div className={cn(styles.claimWidget__card__alert__list, "pb-[69px]")}>
        <>
          <div className={styles.claimWidget__card__alert__list__ready}>
            <Image
              src="/graphics/connected.svg"
              alt="Connected"
              width={286}
              height={63}
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center space-x-3 text-xl text-shade-primary">
                <Image
                  alt="TasksComplete"
                  src="/icons/tasks-complete.svg"
                  width={20}
                  height={20}
                />
                <span>Connection Complete</span>
              </div>
              <div className="text-shade-mute">
                You are{" "}
                <span className="text-shade-secondary">ready to claim</span>{" "}
                your tBTC below
              </div>
            </div>
          </div>
          <div
            className={styles.claimWidget__card__alert__list__ready__claimLine}
          ></div>
        </>
      </div>
    );
  } else {
    return (
      <div className={cn(styles.claimWidget__card__alert__list, "pb-12")}>
        <>
          <div className={styles.claimWidget__card__alert__list__item}>
            <div
              className={`${styles.claimWidget__card__alert__list__item__number}`}
            >
              1
            </div>
            <div className={styles.claimWidget__card__alert__list__item__title}>
              <span>Connect </span> Solana Wallet
            </div>
          </div>
          <div className={styles.claimWidget__card__alert__list__item}>
            <div
              className={`${!bitcoinWalletConnected ? "opacity-25" : ""} ${styles.claimWidget__card__alert__list__item__number}`}
            >
              2
            </div>
            <div className={styles.claimWidget__card__alert__list__item__title}>
              <span>Connect </span> Bitcoin Wallet
            </div>
          </div>
          <div
            className={`${styles.claimWidget__card__alert__list__item} !items-start`}
          >
            <div
              className={`before:hidden ${!bitcoinWalletConnected ? "opacity-25" : ""} ${styles.claimWidget__card__alert__list__item__number}`}
            >
              3
            </div>
            <div className={styles.claimWidget__card__alert__list__item__title}>
              <span>Bind </span> Bitcoin Wallet<br></br>
              <Link
                href="https://faucet.solana.com/"
                target="_blank"
                rel="noreferrer"
                className="text-base text-primary-apollo transition hover:text-primary-apolloHovered"
              >
                Collect devnetSOL for Service Fee
              </Link>
            </div>
          </div>
        </>
      </div>
    );
  }
}
