import * as bitcoin from "bitcoinjs-lib";
import BN from "bn.js";

import { BitcoinNetwork } from "@/types/store";
import { BitcoinXOnlyPublicKey } from "@/types/wallet";

export const UNLOCK_BLOCK_HEIGHT = 4320; // 144 blocks (1 day) * 30

const SATOSHIS_PER_BTC = new BN(1e8);

// FIXME: move to a more appropriate location
/**
 * Converts BTC to Satoshis.
 * @param btc The amount of BTC.
 * @returns The amount of Satoshis.
 * @throws If the input is not a valid number or if the conversion results in a number outside the safe integer range.
 */
export function btcToSatoshi(btc: number): number {
  if (typeof btc !== "number" || isNaN(btc)) {
    throw new Error("Invalid BTC value: must be a number.");
  }

  if (btc < 0) {
    throw new Error("Invalid BTC value: must be non-negative.");
  }

  const btcString = btc.toString();
  const [integerPart, fractionalPart] = btcString.split(".");

  let satoshisBN = new BN(integerPart).mul(SATOSHIS_PER_BTC);

  if (fractionalPart) {
    const fractionalBN = new BN(fractionalPart);
    const multiplier = new BN(10).pow(new BN(fractionalPart.length));
    const fractionalSatoshisBN = fractionalBN
      .mul(SATOSHIS_PER_BTC)
      .div(multiplier);
    satoshisBN = satoshisBN.add(fractionalSatoshisBN);
  }

  if (satoshisBN.gt(new BN(Number.MAX_SAFE_INTEGER.toString()))) {
    throw new Error(
      "BTC value too large. Conversion exceeds safe integer limit."
    );
  }

  return satoshisBN.toNumber();
}

// FIXME: move to a more appropriate location
/**
 * Converts Satoshis to BTC.
 * @param satoshis The amount of Satoshis.
 * @returns The amount of BTC.
 * @throws If the input is not a valid number or if the conversion results in a number outside the safe integer range.
 */
export function satoshiToBtc(satoshis: number): number {
  if (typeof satoshis !== "number" || isNaN(satoshis)) {
    throw new Error("Invalid Satoshi value: must be a number.");
  }
  if (satoshis < 0) {
    throw new Error("Invalid Satoshi value: must be non-negative.");
  }

  const satoshisBN = new BN(satoshis.toString());

  // Perform division and return as a number.  Crucially, use floating-point division here:
  const integerPart = satoshisBN.div(SATOSHIS_PER_BTC).toString();
  const fractionalPart = satoshisBN
    .mod(SATOSHIS_PER_BTC)
    .toString()
    .padStart(8, "0");
  return parseFloat(`${integerPart}.${fractionalPart}`);
}

export const getFullBitcoinExplorerUrl = (
  target: string,
  bitcoinExplorerUrl: string,
  type?: "tx" | "address"
): string => {
  return `${bitcoinExplorerUrl}/${type ?? "tx"}/${target}`;
};

export function convertP2trToTweakedXOnlyPubkey(
  p2trAddress: string
): BitcoinXOnlyPublicKey {
  const { data: tweakedXOnlyPublicKey } =
    bitcoin.address.fromBech32(p2trAddress);

  return tweakedXOnlyPublicKey;
}

export function xOnlyPubkeyHexToP2tr(
  xOnlyPubkey: string,
  network: BitcoinNetwork,
  type: "internal" | "tweaked" = "internal"
) {
  const convertedNetwork = convertBitcoinNetwork(network);

  try {
    const pubkeyBytes = Buffer.from(xOnlyPubkey, "hex");

    const keyofXOnlyPubkey = {
      internal: "internalPubkey",
      tweaked: "pubkey",
    };

    const p2trOutput = bitcoin.payments.p2tr({
      [keyofXOnlyPubkey[type]]: pubkeyBytes,
      network: convertedNetwork,
    });

    return p2trOutput.address ?? "";
  } catch (error) {
    console.error("Error in internal x-only pubkey to P2TR:", error);
    return "";
  }
}

export const convertBitcoinNetwork = (bitcoinNetwork: BitcoinNetwork) => {
  if (bitcoinNetwork === BitcoinNetwork.Regtest)
    return bitcoin.networks.regtest;
  throw new Error("Invalid network type");
};

export default bitcoin;
