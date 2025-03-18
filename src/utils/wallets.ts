export interface Wallet {
  id: string;
  title: string;
  icon: string;
  type: "connector" | "solana";
  isDetected: boolean;
  url: string;
}

export const checkWalletAvailability = () => ({
  muses: typeof window !== "undefined" && window.muses !== undefined,
});

export const txConfirm = {
  isNotRemind: () => {
    if (typeof window === "undefined") return false;
    const value = localStorage.getItem("tx-confirm-modal-remind");
    return value === "0";
  },
  setNotRemind: (notRemind: boolean) => {
    if (typeof window === "undefined") return;
    if (notRemind) {
      localStorage.setItem("tx-confirm-modal-remind", "0");
    } else {
      localStorage.removeItem("tx-confirm-modal-remind");
    }
  },
  reset: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("tx-confirm-modal-remind");
  },
};
