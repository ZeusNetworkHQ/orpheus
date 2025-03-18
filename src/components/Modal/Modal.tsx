"use client";

import { motion, AnimatePresence } from "framer-motion";

import styles from "./styles.module.scss";

type ModalProps = {
  topPosition?: string;
  leftPosition?: string;
  rightPosition?: string;
  bottomPosition?: string;
  width?: string;
  children: React.ReactNode;
  isPositioned?: boolean;
  isOpen: boolean;
  onClose?: () => void;
  isDrawer?: boolean;
  isCentered?: boolean;
  fixedBackdrop?: boolean;
  hideBackdrop?: boolean;
  transparentBackdrop?: boolean;
  overrideHeader?: boolean;
  className?: string;
  animateFrom?: "top" | "bottom" | null;
  cardClasses?: string;
};

export default function Modal({
  topPosition,
  leftPosition,
  rightPosition,
  bottomPosition,
  isPositioned,
  width,
  children,
  isOpen = false,
  isDrawer = true,
  onClose,
  isCentered = false,
  fixedBackdrop = false,
  hideBackdrop = false,
  transparentBackdrop = false,
  overrideHeader = false,
  animateFrom = "top",
  className,
  cardClasses,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={`${styles.modal} ${className ? ` ${className}` : ""} ${overrideHeader ? "!z-50" : ""}`}
          initial={
            animateFrom
              ? { opacity: 0, y: animateFrom === "top" ? -20 : 20 }
              : {}
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          exit={
            isDrawer ? { opacity: 0, y: animateFrom === "top" ? -5 : 5 } : {}
          }
        >
          {hideBackdrop || (
            <motion.div
              className={`${styles.modal__backdrop} ${fixedBackdrop ? ` !fixed top-0` : ""} ${transparentBackdrop ? " !bg-transparent !bg-opacity-100 !backdrop-blur-none" : ""}`}
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
            ></motion.div>
          )}
          <motion.div
            style={
              {
                "--top": topPosition,
                "--bottom": bottomPosition,
                "--left": leftPosition,
                "--right": rightPosition,
                "--cardWidth": width,
              } as React.CSSProperties
            }
            className={`${styles.modal__card} mask-border ${isPositioned && styles.modal__card__positioned} ${isCentered && styles.modal__card__centered} ${isDrawer && styles.modal__card__drawer} ${cardClasses}`}
          >
            <div
              className={`${isDrawer ? styles.modal__card__swipe : ""}`}
            ></div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
