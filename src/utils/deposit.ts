import * as bitcoin from "bitcoinjs-lib";

import { UTXO, UTXOs } from "@/types/api";
import { BitcoinXOnlyPublicKey } from "@/types/wallet";

const TX_INPUT_VBYTE: number = 58;
const TX_BASIC_VBYTE: number = 10;
const TX_OUTPUT_VBYTE: number = 44;

// FIXME: need to figure out the dust amount
const DUST_AMOUNT: number = 546;

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
export const constructDepositToHotReserve = (
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
