import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";

import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";

import ButtonLoader from "../Icons/icons/ButtonLoader";

import styles from "./styles.module.scss";

const getDisplayLabel = ({
  label,
  solanaWalletRequired,
  bitcoinWalletRequired,
  solanaWalletConnected,
  bitcoinWalletConnected,
}: {
  label?: string;
  solanaWalletRequired?: boolean;
  bitcoinWalletRequired?: boolean;
  solanaWalletConnected: boolean;
  bitcoinWalletConnected: boolean;
}) => {
  if (!solanaWalletRequired) return label;

  if (!solanaWalletConnected) {
    return "Connect Wallet";
  }

  if (solanaWalletConnected && !bitcoinWalletRequired) {
    return label;
  }

  if (
    solanaWalletConnected &&
    bitcoinWalletRequired &&
    !bitcoinWalletConnected
  ) {
    return "Connect Bitcoin Wallet";
  }

  return label;
};

type ButtonProps = {
  size?: "xs" | "sm" | "md" | "lg" | "badge" | "none";
  theme?: "primary" | "secondary" | "label" | "connected";
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  label?: string;
  icon?: React.ReactNode;
  iconSize?: 16 | 18;
  iconPosition?: "left" | "right";
  hoveredIcon?: React.ReactNode;
  classes?: string;
  isLoading?: boolean;
  disabled?: boolean;
  solanaWalletRequired?: boolean;
  bitcoinWalletRequired?: boolean;
  truncateText?: boolean;
  style?: React.CSSProperties;
};

export default function Button({
  size = "md",
  theme,
  onClick,
  onMouseEnter,
  onMouseLeave,
  label,
  icon,
  iconPosition = "left",
  iconSize = 18,
  hoveredIcon,
  classes,
  isLoading,
  disabled,
  solanaWalletRequired,
  bitcoinWalletRequired,
  truncateText,
  style,
}: ButtonProps) {
  const openModalByName = useStore((state) => state.openModalByName);
  const { connected: solanaWalletConnected } = useWallet();
  const { setVisible: setShowSolanaModal } = useWalletModal();
  const { connected: bitcoinWalletConnected } = useBitcoinWallet();
  const [prevSolanaWalletConnected, setPrevSolanaWalletConnected] = useState(
    solanaWalletConnected
  );
  const [prevBitcoinWalletConnected, setPrevBitcoinWalletConnected] = useState(
    bitcoinWalletConnected
  );

  const displayLabel = getDisplayLabel({
    label,
    solanaWalletRequired,
    bitcoinWalletRequired,
    solanaWalletConnected,
    bitcoinWalletConnected,
  });

  const buttonClasses = `
    ${classes ?? ""}
    ${disabled ? styles["btn--disabled"] : ""}
    ${styles.btn}
    ${styles[`btn--${size}`]}
    ${styles[`btn--${theme}`]}
    ${hoveredIcon ? styles["btn--animated"] : ""}
    ${isLoading ? styles["btn--loading"] : ""}
    mask-border
  `;

  const handleClick = () => {
    if (solanaWalletRequired && !solanaWalletConnected) {
      setShowSolanaModal(true);
    } else if (
      solanaWalletConnected &&
      bitcoinWalletRequired &&
      !bitcoinWalletConnected
    ) {
      openModalByName(MODAL_NAMES.ADD_NEW_WALLET);
    } else if (onClick) {
      onClick();
    }
  };

  if (
    prevSolanaWalletConnected !== solanaWalletConnected ||
    prevBitcoinWalletConnected !== bitcoinWalletConnected
  ) {
    setPrevSolanaWalletConnected(solanaWalletConnected);
    setPrevBitcoinWalletConnected(bitcoinWalletConnected);
  }

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
    >
      {!isLoading ? (
        <div className={styles.btn__content}>
          {icon && iconPosition === "left" && (
            <span
              className={styles.btn__icon}
              style={{ width: iconSize, height: iconSize }}
            >
              {icon}
            </span>
          )}
          {displayLabel && (
            <span
              className={`${styles.btn__label} ${truncateText && "max-w-[80%] truncate"}`}
            >
              {displayLabel}
            </span>
          )}
          {hoveredIcon && (
            <span className={styles.btn__animated__icon}>{hoveredIcon}</span>
          )}
          {icon && iconPosition === "right" && (
            <span
              className={styles.btn__icon}
              style={{ width: iconSize, height: iconSize }}
            >
              {icon}
            </span>
          )}
        </div>
      ) : (
        <div className={styles.btn__content}>
          <ButtonLoader />
        </div>
      )}
    </button>
  );
}
