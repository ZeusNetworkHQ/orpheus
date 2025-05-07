import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { SolanaNetwork } from "@/types/store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSolanaExplorerUrl = (
  solanaNetwork: SolanaNetwork,
  type: "address" | "tx",
  target: string | undefined
) => {
  if (!target) return "";

  switch (solanaNetwork) {
    case SolanaNetwork.Devnet:
      return `https://explorer.solana.com/${type}/${target}?cluster=devnet`;
    default:
      return `https://explorer.solana.com/${type}/${target}`;
  }
};

export const handleCopy = (value: string = "") => {
  if (!value) return;
  navigator.clipboard.writeText(value);
};
