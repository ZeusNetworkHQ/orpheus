import { cn } from "@/utils/misc";

import styles from "../styles.module.scss";

export default function CardActionsHeader() {
  return (
    <div className={cn(styles.claimWidget__card__actions__title, "pb-11")}>
      Claim your free tBTC
    </div>
  );
}
