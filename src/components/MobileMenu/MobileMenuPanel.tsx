"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWindowSize } from "usehooks-ts";

import Icon from "@/components/Icons";
import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";

import Modal from "../Modal/Modal";

import styles from "./styles.module.scss";

export default function MobileMenuPanel() {
  const pathname = usePathname();
  const currentModal = useStore((state) => state.currentModal);
  const closeModal = useStore((state) => state.closeModal);
  const { width = 0 } = useWindowSize();
  const isTablet = width < 1024;

  return (
    <Modal
      width="450px"
      isOpen={currentModal === MODAL_NAMES.MOBILE_MENU && isTablet}
      isPositioned={true}
      isDrawer={false}
      topPosition="60px"
      rightPosition="24px"
      onClose={closeModal}
    >
      <div className={styles.mobileMenu}>
        <Link
          href={"/"}
          className={`${styles.mobileMenu__link} ${pathname === "/" ? styles.activeLink : ""}`}
          onClick={() => {
            closeModal();
          }}
        >
          <Icon name="Provide" />
          <span className={styles.mobileMenu__link__text}>Mint</span>
        </Link>
        <div
          className={`${styles.mobileMenu__link} ${styles.nav__icon} ${pathname === "/portfolio" || pathname === "/portfolio/transactions" ? styles.activeLink : ""}`}
          onClick={() => {
            closeModal();
          }}
        >
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="Portfolio" />
              <span className={styles.mobileMenu__link__text}>Portfolio</span>
            </div>

            <div className="flex flex-col px-4">
              <Link
                href="/portfolio"
                className="p-2 text-shade-secondary hover:text-shade-primary"
              >
                Overview
              </Link>
              <Link
                href="/portfolio/transactions"
                className="p-2 text-shade-secondary hover:text-shade-primary"
              >
                Transactions
              </Link>
            </div>
          </div>
        </div>
        <Link
          href="/claim"
          className={`${styles.mobileMenu__link} ${pathname === "/claim" ? styles.activeLink : ""} relative`}
          onClick={closeModal}
        >
          <Icon name="Claim" />
          <span className={styles.mobileMenu__link__text}>Claim</span>
        </Link>
        <Link
          href="/dashboard"
          className={`${styles.mobileMenu__link} ${pathname === "/dashboard" ? styles.activeLink : ""}`}
          onClick={closeModal}
        >
          <Icon name="Network" />
          <span className={styles.mobileMenu__link__text}>Dashboard</span>
        </Link>
      </div>
    </Modal>
  );
}
