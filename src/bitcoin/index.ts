import * as bitcoin from "bitcoinjs-lib";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import BN from "bn.js";
import * as tools from "uint8array-tools";

import { UTXO, UTXOs } from "@/types/api";
import { BitcoinNetwork } from "@/types/store";
import { BitcoinXOnlyPublicKey } from "@/types/wallet";

export const UNLOCK_BLOCK_HEIGHT = 4320; // 144 blocks (1 day) * 30

const SATOSHIS_PER_BTC = new BN(1e8);

const TX_INPUT_VBYTE: number = 58;
const TX_BASIC_VBYTE: number = 10;
const TX_OUTPUT_VBYTE: number = 44;

// FIXME: need to figure out the dust amount
const DUST_AMOUNT: number = 546;

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

const isSpendable = (utxo: UTXO, satoshisPerVBytes: number): boolean => {
  return (
    BigInt(Math.round(utxo.satoshis)) >
    BigInt(Math.ceil(satoshisPerVBytes * TX_INPUT_VBYTE))
  );
};

/**
 *
 * @param utxos available utxos
 * @param hotReserveAddress hot reserve address in p2tr format
 * @param amount amount to deposit (satoshis)
 * @param userXOnlyPubKey userXonlyPubKey
 * @param feeRate fee rate in satoshis per vbyte
 * @param network network
 * @returns
 */
export const constructDepositToHotReserveTx = (
  utxos: UTXOs,
  hotReserveAddress: string,
  amount: number,
  userXOnlyPubKey: BitcoinXOnlyPublicKey,
  feeRate: number,
  network: bitcoin.networks.Network,
  isDepositAll: boolean = false
): {
  psbt: bitcoin.Psbt;
  amountToSend: number;
  returnAmount: number;
  usedUTXOs: UTXOs;
} => {
  if (utxos.length === 0) {
    throw new Error("No UTXOs available");
  }

  if (feeRate < 1) {
    throw new Error("Invalid satoshisPerVBytes");
  }

  // FIXME: sort utxos by satoshis from low to high
  utxos.sort((a, b) => a.satoshis - b.satoshis);

  // if the fee is higher than the amount to deposit
  const spendableUTXOs = utxos.filter((utxo) => isSpendable(utxo, feeRate));

  if (spendableUTXOs.length === 0) {
    throw new Error("No spendable UTXOs available");
  }

  // available amount
  const totalAvailableAmount = spendableUTXOs.reduce(
    (acc, utxo) => acc + utxo.satoshis,
    0
  );

  if (totalAvailableAmount < amount) {
    throw new Error("Insufficient balance");
  }

  const amountToSend = amount;

  const { output, address } = bitcoin.payments.p2tr({
    internalPubkey: userXOnlyPubKey,
    network: network,
  });

  if (!output) {
    throw new Error("Invalid output");
  }

  if (!address) {
    throw new Error("Invalid address");
  }

  const psbt = new bitcoin.Psbt({ network }).setVersion(2);

  let TOTAL_VBYTE = TX_BASIC_VBYTE;
  let preparedAmount = BigInt(0);

  const pickedUTXOs: UTXOs = [];

  for (const utxo of spendableUTXOs) {
    psbt.addInput({
      hash: utxo.transaction_id,
      index: utxo.transaction_index,
      witnessUtxo: {
        script: output!,
        value: utxo.satoshis,
      },
      tapInternalKey: userXOnlyPubKey,
    });
    preparedAmount += BigInt(utxo.satoshis);
    TOTAL_VBYTE += TX_INPUT_VBYTE;
    pickedUTXOs.push(utxo);
    if (
      preparedAmount >=
      BigInt(amountToSend) + BigInt(feeRate) * BigInt(Math.ceil(TOTAL_VBYTE))
    ) {
      break;
    }
  }

  // basic 1 output
  TOTAL_VBYTE += TX_OUTPUT_VBYTE;

  // if not deposit all, add 1 more output
  if (!isDepositAll) {
    TOTAL_VBYTE += TX_OUTPUT_VBYTE;
  }

  const returnAmount = Number(
    preparedAmount -
      BigInt(amountToSend) -
      BigInt(feeRate) * BigInt(Math.ceil(TOTAL_VBYTE))
  );

  if (returnAmount < 0) {
    throw new Error("Insufficient balance for fee");
  }

  psbt.addOutput({
    address: hotReserveAddress,
    value: amountToSend,
  });

  // FIXME: there is a return amount, might need to handle minimum dust amount
  if (returnAmount != 0 && returnAmount > DUST_AMOUNT) {
    psbt.addOutput({
      address: address,
      value: returnAmount,
    });
  }

  psbt.setMaximumFeeRate(feeRate + 1);

  return {
    psbt,
    amountToSend: Number(amountToSend),
    returnAmount: Number(returnAmount),
    usedUTXOs: pickedUTXOs,
  };
};

/**
 *
 * @param utxos available utxos
 * @param feeRate fee rate in satoshis per vbyte
 * @returns spendable amount in satoshis
 */
export const estimateMaxSpendableAmount = (
  utxos: UTXOs,
  feeRate: number
): number => {
  if (utxos.length === 0) {
    return 0;
  }

  // FIXME: if need?
  const spendableUTXOs = utxos.filter((utxo) => isSpendable(utxo, feeRate));

  if (spendableUTXOs.length === 0) {
    return 0;
  }

  let preparedAmount = BigInt(0);
  let TOTAL_VBYTE = TX_BASIC_VBYTE;

  for (const utxo of spendableUTXOs) {
    TOTAL_VBYTE += TX_INPUT_VBYTE;
    preparedAmount += BigInt(utxo.satoshis);
  }

  // spend all means only 1 output
  TOTAL_VBYTE += TX_OUTPUT_VBYTE;

  const toSendAmount =
    preparedAmount - BigInt(feeRate) * BigInt(Math.ceil(TOTAL_VBYTE));

  return Number(toSendAmount);
};

/**
 * Calculate the hot reserve bucket address based on the cold reserve address's internal key and the user's unlocking script.
 * * the key_path_spend_public_key and script_path_spend_public_key must be tweaked public keys.
 * @param {Buffer} key_path_spend_public_key - cold reserve address's internal key (must be tweaked public key)
 * @param {Buffer} script_path_spend_public_key - user's unlocking script (must be tweaked public key)
 * @param {number} lockTime - the lock time of the hot reserve address
 * @param {bitcoin.Network=} network - the network to use
 * @return - the hot reserve address and the script
 */
export function deriveHotReserveAddress(
  // tweaked pubkey that could directly spend the UTXO, usually the address of zeus node operator
  key_path_spend_public_key: Buffer,
  // user's unlocking script
  script_path_spend_public_key: Buffer,
  lockTime: number,
  network?: bitcoin.Network
): {
  address: string;
  script: Buffer;
  hash: Buffer | undefined;
  output: Buffer | undefined;
  pubkey: Buffer | undefined;
} {
  network = network ?? bitcoin.networks.regtest;

  // bitcoin csv encoding sample
  // * ref: https://github.com/bitcoinjs/bitcoinjs-lib/blob/151173f05e26a9af7c98d8d1e3f90e97185955f1/test/integration/csv.spec.ts#L61
  const targetScript = `${tools.toHex(bitcoin.script.number.encode(lockTime))} OP_CHECKSEQUENCEVERIFY OP_DROP ${toXOnly(script_path_spend_public_key).toString("hex")} OP_CHECKSIG`;

  const tap = bitcoin.script.fromASM(targetScript);

  const script_p2tr = bitcoin.payments.p2tr({
    internalPubkey: toXOnly(key_path_spend_public_key),
    scriptTree: {
      output: tap,
    },
    network,
  });

  if (script_p2tr.address === undefined) {
    throw new Error("Failed to calculate the address");
  }

  return {
    address: script_p2tr.address!,
    script: tap,
    hash: script_p2tr.hash,
    output: script_p2tr.output,
    pubkey: script_p2tr.pubkey,
  };
}

export default bitcoin;
