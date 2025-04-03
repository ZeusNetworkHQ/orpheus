import { motion } from "framer-motion";

import Icon from "@/components/Icons";
import Button from "@/components/WalletButton/Button";

import styles from "../styles.module.scss";

export default function CardActionsFooter({
  claimableTimes,
  claimedProgress,
  handleClaim,
  isClaiming,
  isAllConnected,
}: {
  claimableTimes: number;
  claimedProgress: number;
  handleClaim: () => void;
  isClaiming: boolean;
  isAllConnected: boolean;
}) {
  const isFullyClaimed = isAllConnected && claimableTimes === 0;

  return (
    <div
      className={`${styles.claimWidget__card__actions} ${styles.claimWidget__card__actions__glow}`}
    >
      <Button
        icon={!isAllConnected && <Icon name="Wallet" />}
        theme="primary"
        size="lg"
        label={isFullyClaimed ? "Fully Claimed" : "Claim"}
        solanaWalletRequired={!isFullyClaimed}
        bitcoinWalletRequired={!isFullyClaimed}
        onClick={!isFullyClaimed ? handleClaim : undefined}
        isLoading={!isFullyClaimed && isClaiming}
        disabled={isFullyClaimed}
      />

      {isAllConnected && claimableTimes > 0 && (
        <div className={styles.claimWidget__card__claimInfo}>
          <div className={styles.claimWidget__card__claimInfo__title}>
            <Icon name="Alert" />
            You can claim {claimableTimes} times a day
          </div>
          <div className={styles.claimWidget__card__claimInfo__bar__wrapper}>
            <div className={styles.claimWidget__card__claimInfo__bar}>
              <motion.div
                className={styles.claimWidget__card__claimInfo__bar__progress}
                style={{
                  width: `${claimedProgress}%`,
                  backgroundColor: "#ffa794",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
