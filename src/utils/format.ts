import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";

import { EllipsisPosition } from "@/types/misc";

export const formatDate = (date: number) => {
  return dayjs(date).format("YYYY.MM.DD HH:mm:ss");
};

export function formatSolanaAddress(
  address: PublicKey | null | undefined
): string {
  if (!address) return "Unknown";
  const addressStr = address.toString();
  // if (addressStr.length < 44) return addressStr;
  return `${addressStr.slice(0, 4)}...${addressStr.slice(-4)}`;
}

export function formatBitcoinAddress(
  address: string | null | undefined
): string {
  if (!address) return "Unknown";
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatValue(
  value: number | BigNumber | undefined,
  decimals = 2
): string {
  const tmp = value || 0;
  if (tmp === 0) return "0";

  // Convert to BigNumber and round down based on decimal places
  const bnValue = new BigNumber(tmp);
  const roundedValue = bnValue.decimalPlaces(decimals, BigNumber.ROUND_DOWN);

  return roundedValue.toNumber().toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function shortenString(
  str: string,
  length = 16,
  ellipsisPosition: EllipsisPosition = "middle"
): string {
  if (str.length <= length) {
    return str;
  }
  if (ellipsisPosition === "middle") {
    return `${str.slice(0, Math.floor(length / 2))}...${str.slice(-Math.floor(length / 2))}`;
  }
  return `${str.slice(0, length)}...`;
}
