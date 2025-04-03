import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext } from "react";
import { useWindowSize } from "usehooks-ts";

import Icon from "@/components/Icons";

import wrapImportant from "../wrapImportant";

export interface ModalProps {
  /** Modal Type */
  type?: "default" | "emphasized" | "binary";
  /** Desktop Width */
  width?: number;
  /** Is the modal open */
  isOpen: boolean;
  /** Function to call when modal is closed */
  onClose?: () => void;
  /** Custom classNames of Modal Card */
  className?: string;
  /** Modal Content */
  children: React.ReactNode;
  /** Backdrop Type*/
  backdropType: "default" | "hidden" | "overrideHeader";
  /** Custom Positioning */
  /* Overrides Center Positioning */
  position?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  /** Animate from */
  animateFrom?: "top" | "bottom" | null;
  /** Close on Backdrop Click */
  closeOnBackdropClick?: boolean;
}

export interface ModalHeaderProps {
  /** Title */
  title?: string;
  /** Close Button */
  onClose?: () => void;
  /** Custom ClassName */
  className?: string;
  /** Hide close button */
  hideCloseButton?: boolean;
}

export interface ModalActionsProps {
  /** Children */
  children: React.ReactNode;
  /** Annotation */
  annotation?: string;
  /** Custom ClassName */
  className?: string;
}

interface ModalContextType {
  type?: "default" | "emphasized" | "binary";
}

const ModalContext = createContext<ModalContextType>({
  type: "default",
});

const Modal = ({
  width = 360,
  isOpen = false,
  onClose,
  className,
  children,
  backdropType = "default",
  position,
  type = "default",
  animateFrom = "bottom",
  closeOnBackdropClick = true,
}: ModalProps) => {
  const { width: windowWidth } = useWindowSize();
  const computedWidth =
    windowWidth < 550 ? "100%" : width ? `${width}px` : "auto";

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalContext.Provider value={{ type }}>
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={classNames(
              "fixed inset-0 z-40 flex h-screen w-full items-center justify-center overflow-y-auto",
              backdropType === "overrideHeader" && "!z-50"
            )}
          >
            {/* Backdrop */}
            <motion.div
              key="card"
              onClick={closeOnBackdropClick ? onClose : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
              className={classNames(
                "z-20 h-full w-full",
                // Default Style
                backdropType === "default" &&
                  "bg-sys-color-background-overlay absolute inset-0 backdrop-blur-sm",
                // Hidden Styles
                backdropType === "hidden" &&
                  "absolute bg-transparent backdrop-blur-none",
                // Override Header
                backdropType === "overrideHeader" &&
                  "bg-sys-color-background-overlay fixed inset-0 z-50 backdrop-blur-sm"
              )}
            ></motion.div>

            {/* Card */}
            <motion.div
              initial={
                animateFrom
                  ? { opacity: 0, y: animateFrom === "top" ? -20 : 20 }
                  : {}
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              exit={{}}
              className={classNames(
                className,
                // All Styles
                "gradient-border bg-sys-color-background-card rounded-16 before:from-sys-color-text-mute/30 before:to-sys-color-text-mute/10 relative z-50 items-center justify-center px-16 shadow-[0px_2px_6px_rgba(15,15,18,0.4)] before:z-10",
                // Default + Binary Styles
                (type === "default" || type === "binary") && "py-24",
                // Desktop Styles
                "px-16",
                // Emphasized Padding
                type === "emphasized" && "pb-16 pt-24",
                // Positioning
                position !== null && "!absolute"
              )}
              style={{
                width: computedWidth,
                top: position?.top && `${position.top}px`,
                left: position?.left && `${position.left}px`,
                right: position?.right && `${position.right}px`,
                bottom: position?.bottom && `${position.bottom}px`,
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        </ModalContext.Provider>
      )}
    </AnimatePresence>
  );
};

const ModalHeader = ({
  title,
  onClose,
  className,
  hideCloseButton,
}: ModalHeaderProps) => {
  const { type } = useContext(ModalContext);
  return (
    <div className="z-20 flex w-full flex-col items-center justify-center">
      {/* Close Button */}
      {!hideCloseButton && (
        <div
          className={classNames(
            // Default Styles
            "text-sys-color-text-mute hover:text-sys-color-text-primary absolute right-16 top-16 transition hover:cursor-pointer",
            className
          )}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onClose?.();
            }
          }}
        >
          <Icon name="Close" />
        </div>
      )}
      {title && (
        <div
          className={classNames("flex w-full items-center justify-center", {
            // Default Styles
            "text-sys-color-text-primary headline-headline5":
              type === "default" || type === "binary",
            // Annotation Styles
            "text-sys-color-text-secondary headline-headline6 pt-4":
              type === "emphasized",
          })}
        >
          {title}
        </div>
      )}
    </div>
  );
};

const ModalActions = ({
  children,
  annotation,
  className,
}: ModalActionsProps) => {
  return (
    <div
      className={classNames(
        "flex w-full flex-col items-center justify-center gap-y-24",
        className
      )}
    >
      <div className="relative z-10 flex w-full items-center gap-x-8">
        {children}
      </div>
      {annotation && (
        <div className="text-sys-color-text-secondary flex items-center gap-x-8">
          <Icon name="Error" className="text-apollo-brand-primary-blue" />
          <span className="text-sys-color-text-mute body-body1-medium">
            {annotation}
          </span>
        </div>
      )}
    </div>
  );
};

const WrappedModal = wrapImportant(Modal);
const WrappedModalHeader = wrapImportant(ModalHeader);
const WrappedModalActions = wrapImportant(ModalActions);

export {
  WrappedModal as Modal,
  WrappedModalHeader as ModalHeader,
  WrappedModalActions as ModalActions,
};

export default WrappedModal;
