"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";

import Badge from "../../Badge/Badge";

import styles from "./styles.module.scss";

type tabProps = {
  tabs: Array<{
    label: string;
    value: string;
    badge?: string;
    isDisabled?: boolean;
    icon?: React.ReactNode;
  }>;
  activeTab: number;
  loginRequired?: boolean;
  onClick: (tab: string) => void;
  isSubTab?: boolean;
  subTabLayoutStyle?: string;
  subTabStyle?: string;
  subTabSelectedTabStyle?: string;
  className?: string;
};

export default function Tabs({
  tabs,
  activeTab = 0,
  onClick,
  loginRequired = true,
  isSubTab,
  subTabLayoutStyle,
  subTabStyle,
  subTabSelectedTabStyle,
  className,
}: tabProps) {
  const { connected: solanaWalletConnected } = useWallet();

  const ACTIVE = "active";

  const subTabVariants = {
    [ACTIVE]: {
      color: "#546CF1",
      backgroundColor: "rgba(84, 108, 241, 0.1)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div
      className={`${className} ${
        isSubTab
          ? `${subTabLayoutStyle ? subTabLayoutStyle : "w-fit rounded-2xl border border-shade-cardLight p-1"} ${styles.subTabs}`
          : styles.tabs
      }`}
    >
      {tabs.map((tab, index) => {
        const tabClasses = isSubTab
          ? `${styles.subTabs__tab} ${tab.isDisabled && styles.subTabs__disabled} ${!solanaWalletConnected && loginRequired && styles.subTabs__disabled} ${activeTab === index && styles.subTabs__selected} ${subTabStyle ? subTabStyle : "w-max-content px-4"}`
          : `${styles.tabs__tab} ${tab.isDisabled && styles.tabs__disabled} ${!solanaWalletConnected && loginRequired && styles.tabs__disabled} ${activeTab === index && styles.tabs__selected}`;
        return (
          <button
            key={tab.value}
            className={tabClasses}
            disabled={
              tab.isDisabled || (!solanaWalletConnected && loginRequired)
            }
            onClick={() => onClick(tab.value)}
          >
            {tab.icon && (
              <div className={styles.tabs__tab__icon}>{tab.icon}</div>
            )}
            <span>{tab.label}</span>
            {activeTab === index && isSubTab ? (
              <motion.div
                variants={subTabVariants}
                animate={ACTIVE}
                className={`${styles.subTabs__tab__selected} !ml-0 ${subTabSelectedTabStyle ? subTabSelectedTabStyle : ""}`}
              />
            ) : (
              <div className={`${styles.tabs__tab__selected} !ml-0`} />
            )}
            {tab.badge && solanaWalletConnected && !tab.isDisabled && (
              <Badge classes="!ml-2" label={tab.badge} />
            )}
          </button>
        );
      })}
    </div>
  );
}
