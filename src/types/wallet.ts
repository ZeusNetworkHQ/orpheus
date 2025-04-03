import { ECPairInterface } from "ecpair";

import bitcoin from "@/bitcoin";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    muses?: any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type BitcoinXOnlyPublicKey = Buffer;

export type BitcoinAddress = Buffer;

export interface BitcoinWallet {
  pubkey: string;
  p2tr: string;
  privkeyHex?: string;
  privkey?: ECPairInterface;
  p2pkh?: string;
  p2wpkh?: string;
  tweakSigner?: bitcoin.Signer;
  signer?: bitcoin.Signer;
}

export enum EventName {
  sendUserOp = "sendUserOp",
  sendUserOpResult = "sendUserOpResult",

  personalSign = "personalSign",
  personalSignResult = "personalSignResult",

  signTypedData = "signTypedData",
  signTypedDataResult = "signTypedDataResult",
}
