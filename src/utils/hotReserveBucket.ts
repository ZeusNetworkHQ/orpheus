import * as bitcoin from "bitcoinjs-lib";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import BN from "bn.js";
import * as tools from "uint8array-tools";

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

/**
 * Calculate the hot reserve bucket address based on the cold reserve address's internal key and the user's unlocking script.
 * * the key_path_spend_public_key and script_path_spend_public_key must be tweaked public keys.
 * @param {Buffer} key_path_spend_public_key - cold reserve address's internal key (must be tweaked public key)
 * @param {Buffer} script_path_spend_public_key - user's unlocking script (must be tweaked public key)
 * @param {number} lockTime - the lock time of the hot reserve address
 * @param {bitcoin.Network=} network - the network to use
 * @return - the hot reserve address and the script
 */
export function hotReserveAddressCalculate(
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
