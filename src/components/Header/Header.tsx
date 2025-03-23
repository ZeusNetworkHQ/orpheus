"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Icon from "@/components/Icons";
import { PortfolioDropdown } from "@/components/PortfolioV2/PortfolioDropdown";
import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";
import { cn } from "@/utils/misc";

import ButtonArrow from "../Icons/icons/ButtonArrow";
import Network from "../Icons/icons/Network";
import PortfolioIcon from "../Icons/icons/Portfolio";
import Provide from "../Icons/icons/Provide";
import TickIcon from "../Icons/icons/TickIcon";
import Wallet from "../Icons/icons/Wallet";
import Button from "../WalletButton/Button";

import styles from "./styles.module.scss";

export default function Header() {
  const pathname = usePathname();
  const currentModal = useStore((state) => state.currentModal);
  const openModalByName = useStore((state) => state.openModalByName);
  const { connected: solanaWalletConnected } = useWallet();

  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-shade-background lg:pt-2.5",
        currentModal === MODAL_NAMES.ENDPOINT_SELECTOR && "!z-0",
        currentModal !== null && "!z-0"
      )}
    >
      <div className={`${styles.header}`}>
        <div className={styles.header__container}>
          <div className={styles.header__container__start}>
            <div className={styles.header__container__start__logo}>
              <Link href="/">
                <Image
                  src="/branding/logo-primary.svg"
                  height={22}
                  width={105}
                  alt="Apollo Logo Primary"
                />
              </Link>
            </div>
            <div className={styles.header__container__start__nav}>
              <Link
                href={"/"}
                className={`${styles.nav__icon} ${pathname === "/" ? styles.activeLink : ""}`}
              >
                <Provide />
                <span>Mint</span>
              </Link>
              <Link
                href="#"
                className={`relative ${styles.nav__icon} ${pathname === "/portfolio" || pathname === "/portfolio/transactions" ? styles.activeLink : ""}`}
                onMouseEnter={() => {
                  setIsPortfolioMenuOpen(true);
                }}
                onMouseLeave={() => {
                  setIsPortfolioMenuOpen(false);
                }}
              >
                <PortfolioIcon />
                <span>Portfolio</span>
                <PortfolioDropdown isOpen={isPortfolioMenuOpen} />
              </Link>
              <Link
                href="/claim"
                className={`${styles.nav__icon} ${pathname === "/claim" ? styles.activeLink : ""}`}
              >
                <Icon name="Claim" />
                <span>Claim</span>
              </Link>
              <Link
                href="/dashboard"
                className={`${styles.nav__icon} ${pathname === "/dashboard" ? styles.activeLink : ""} `}
              >
                <Network />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
          <div className={`${styles.header__container__end__desktop}`}>
            <Button
              theme={!solanaWalletConnected ? "primary" : "connected"}
              label="Connected"
              icon={!solanaWalletConnected ? <Wallet /> : <TickIcon />}
              hoveredIcon={<ButtonArrow />}
              iconPosition="left"
              onClick={() => {
                openModalByName(MODAL_NAMES.WALLET_SELECTOR);
              }}
              isLoading={currentModal === MODAL_NAMES.WALLET_SELECTOR}
              solanaWalletRequired
            />
          </div>
        </div>
      </div>
    </header>
  );
}
