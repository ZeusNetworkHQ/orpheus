"use client";
import * as bitcoin from "bitcoinjs-lib";
import { Dispatch, SetStateAction, createContext, useContext } from "react";

import { BitcoinWallet } from "@/types/wallet";

import { type BaseConnector } from "../connector/base";

export interface BitcoinWalletContextState {
  wallet: BitcoinWallet | null;
  connecting: boolean;
  connected: boolean;
  disconnecting: boolean;
  connectConnectorWallet: (
    connector: BaseConnector,
    isReconnect?: boolean
  ) => Promise<void>;
  connectDerivedWallet: () => Promise<void>;
  disconnect: () => void;
  signPsbt(psbt: bitcoin.Psbt, tweaked?: boolean): Promise<string>;

  // Connector Wallet States
  accounts: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  disconnectConnector: () => void;
  getPublicKey: (connector: BaseConnector) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  evmAccount?: string;
  switchNetwork: (network: "livenet" | "testnet") => Promise<void>;
  getNetwork: () => Promise<"livenet" | "testnet">;
  sendBitcoin: (
    toAddress: string,
    satoshis: number,
    options?: { feeRate: number }
  ) => Promise<string>;
  bitcoinWalletType: BitcoinWalletType;
  setBitcoinWalletType: Dispatch<SetStateAction<BitcoinWalletType>>;
  connectors: BaseConnector[];
  connector: BaseConnector | undefined;
  setConnectorId: (connectorId?: string) => void;
  handleConnectorId: (connectorId: string) => Promise<void>;
  connectorId: string | undefined;
}

export const BitcoinWalletContext = createContext(
  {} as BitcoinWalletContextState
);

export function useBitcoinWallet() {
  return useContext(BitcoinWalletContext);
}

export type BitcoinWalletType = "connector" | "solana" | null;
