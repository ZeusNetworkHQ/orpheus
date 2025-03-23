import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface PortfolioDropdownProps {
  isOpen: boolean;
}

export const PortfolioDropdown = ({ isOpen }: PortfolioDropdownProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="ds contents">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-12 body-body1-medium border-sys-color-text-mute/15 bg-sys-color-background-card absolute left-0 top-full w-max border p-4"
          >
            <div className="flex flex-col gap-y-[4px]">
              <Link
                href="/portfolio"
                className="hover:bg-sys-color-background-card-foreground text-sys-color-text-secondary hover:text-sys-color-text-primary rounded-8 px-[12px] py-[8px] transition"
              >
                Overview
              </Link>
              <Link
                href="/portfolio/transactions"
                className="hover:bg-sys-color-background-card-foreground text-sys-color-text-secondary hover:text-sys-color-text-primary rounded-8 px-[12px] py-[8px] transition"
              >
                Transactions
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
