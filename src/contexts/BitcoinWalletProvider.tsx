"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as bitcoin from "bitcoinjs-lib";
import {
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
  createContext,
  SetStateAction,
  Dispatch,
  useContext,
} from "react";

import {
  deriveBitcoinWallet,
  getBitcoinConnectorWallet,
} from "@/bitcoin/wallet";
import { txConfirm } from "@/bitcoin/wallet";
import { MusesConnector } from "@/connector";
import usePersistentStore from "@/stores/persistentStore";
import { BitcoinNetwork } from "@/types/store";
import { BitcoinWallet, EventName } from "@/types/wallet";
import events from "@/utils/event";
import { notifyError } from "@/utils/notification";

import { type BaseConnector } from "../connector/base";

const connectors: BaseConnector[] = [new MusesConnector()];

export type BitcoinWalletType = "connector" | "solana" | null;

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

const BitcoinWalletContext = createContext<BitcoinWalletContextState | null>(
  null
);

export function BitcoinWalletProvider({ children }: { children: ReactNode }) {
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const { publicKey: solanaPubkey, signMessage: solanaSignMessage } =
    useWallet();
  const [bitcoinWallet, setBitcoinWallet] = useState<BitcoinWallet | null>(
    null
  );
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [bitcoinWalletType, setBitcoinWalletType] =
    useState<BitcoinWalletType>(null);
  const [prevBitcoinNetwork, setPrevBitcoinNetwork] = useState<
    BitcoinNetwork | undefined
  >(bitcoinNetwork);
  const [prevSolanaPubkey, setPrevSolanaPubkey] = useState<
    PublicKey | null | undefined
  >(undefined);
  const [connectorId, setConnectorId] = useState<string | undefined>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const connector = useMemo(() => {
    return connectors?.find((item) => item.metadata.id === connectorId);
  }, [connectorId]);

  // FIXME:
  // ! unknown reason for no connector.disconnect() function call, not sure if it's a bug
  const handleDisconnect = useCallback(() => {
    setDisconnecting(true);
    try {
      setConnected(false);
      setBitcoinWallet(null);
      setBitcoinWalletType(null);
      setAccounts([]);
      localStorage.removeItem("current-connector-id");
    } catch (e) {
      console.error(`Error in disconnect: ${e}`);
    } finally {
      setDisconnecting(false);
    }
  }, []);

  const handleSignPsbt = useCallback(
    async (psbt: bitcoin.Psbt, tweaked?: boolean) => {
      if (!bitcoinWallet) {
        throw new Error("Bitcoin wallet not connected");
      }

      // ! self derived wallet only for local test
      if (
        bitcoinWalletType === "solana" &&
        bitcoinWallet.tweakSigner &&
        bitcoinWallet.signer
      ) {
        if (tweaked) {
          psbt.signAllInputs(bitcoinWallet.tweakSigner);
        } else {
          psbt.signAllInputs(bitcoinWallet.signer);
        }
        psbt.finalizeAllInputs();
        return psbt.extractTransaction().toHex();
      }

      if (!connector) {
        throw new Error("Connector is not defined");
      }

      let signedPsbtHex = "";
      // TODO: currently only support the input pubkey is equal to the wallet's pubkey, no need to tweak the signer, leaved for future implementation
      // const provider = await connector.getProvider();

      // if (!provider) {
      //   throw new Error("Provider is not defined");
      // }

      // const toSignInputs = psbt.data.inputs.map((input, index) => {
      //   return {
      //     index,
      //     publicKey: bitcoinWallet.pubkey,
      //     disableTweakSigner: !tweaked,
      //   };
      // });

      // signedPsbtHex = await provider.signPsbt(psbt.toHex(), {
      //   autoFinalized: false,
      //   toSignInputs,
      // });

      // TODO: might need to checked if all provider signPsbt function is the same
      signedPsbtHex = await connector.signPsbt(psbt.toHex(), {
        autoFinalized: false,
      });

      psbt = bitcoin.Psbt.fromHex(signedPsbtHex);
      psbt.finalizeAllInputs();

      return psbt.extractTransaction().toHex();
    },
    [bitcoinWallet, bitcoinWalletType, connector]
  );

  const getPublicKey = useCallback(async (connector: BaseConnector) => {
    if (!connector) {
      throw new Error("Wallet not connected!");
    }
    const pubkey = await connector.getPublicKey();
    return pubkey;
  }, []);

  const signMessage = useCallback(
    async (message: string) => {
      if (!connector) {
        throw new Error("Wallet not connected!");
      }
      return connector.signMessage(message);
    },
    [connector]
  );

  const sendBitcoin = useCallback(
    async (
      toAddress: string,
      satoshis: number,
      options?: { feeRate: number }
    ) => {
      if (!connector) {
        throw new Error("Wallet not connected!");
      }

      return connector.sendBitcoin(toAddress, satoshis, options);
    },
    [connector]
  );

  const getNetwork = useCallback(async () => {
    if (!connector) {
      throw new Error("Wallet not connected!");
    }
    return connector.getNetwork();
  }, [connector]);

  // WARNING: not all connectors support switchNetwork
  const switchNetwork = useCallback(
    async (network: "livenet" | "testnet") => {
      if (!connector) {
        throw new Error("Wallet not connected!");
      }
      await connector.switchNetwork(network);
    },
    [connector]
  );

  const provider = useMemo(() => {
    if (connectorId) {
      return connectors
        .find((item) => item.metadata.id === connectorId)
        ?.getProvider();
    }
  }, [connectorId]);

  const disconnectConnector = useCallback(() => {
    localStorage.removeItem("current-connector-id");
    txConfirm.reset();
    if (connector) {
      connector.disconnect();
    }
    setConnectorId(undefined);
  }, [connector]);

  const getBitcoinWallet = useCallback(
    async (connector: BaseConnector) => {
      if (!connector) {
        throw new Error("Connector is not defined");
      }

      const pubkey = await connector.getPublicKey();
      return getBitcoinConnectorWallet(pubkey, bitcoinNetwork);
    },
    [bitcoinNetwork]
  );

  const handleDerivedWalletConnect = useCallback(async () => {
    setConnecting(true);
    let res = null;
    try {
      if (!solanaPubkey) {
        console.log("Solana public key is missing");
        return;
      }

      if (solanaSignMessage) {
        setBitcoinWalletType("solana");
        res = await deriveBitcoinWallet(
          solanaPubkey,
          bitcoinNetwork,
          solanaSignMessage
        );
      }

      if (!res) {
        console.log("Error connecting Bitcoin wallet");
        setConnected(false);
        setBitcoinWalletType(null);
        return;
      } else {
        setConnectorId(undefined);
        setBitcoinWallet(res);
        setAccounts([res.p2tr]);
        setConnected(true);
      }
    } catch (e) {
      console.error(`Error in connect: ${e}`);
      setBitcoinWalletType(null);
    } finally {
      setConnecting(false);
    }
  }, [bitcoinNetwork, solanaPubkey, solanaSignMessage]);

  const handleConnectorConnect = useCallback(
    async (connector: BaseConnector) => {
      setConnecting(true);
      let res = null;
      try {
        if (!connector) {
          throw new Error("Connector is not defined");
        }
        if (!solanaPubkey) {
          throw new Error("Solana public key is missing");
        }
        setBitcoinWalletType("connector");

        // since the following function getBitcoinWallet will call the connector.getPublicKey() function, we need to connect to the wallet first
        // or else will get error "Wallet not connected!"
        await connector.requestAccounts();

        res = await getBitcoinWallet(connector);

        setBitcoinWallet(res);
        setAccounts([res.p2tr]);
        setConnectorId(connector.metadata.id);
        setConnected(true);
        localStorage.setItem("current-connector-id", connector.metadata.id);

        if (!res) {
          console.log("Error connecting Bitcoin wallet");
          setConnected(false);
          setBitcoinWalletType(null);
          return;
        }
      } catch (e) {
        console.error("Error in connect: ", e);
        if (
          e instanceof Error &&
          e.message.includes("only support") &&
          e.message.includes("p2tr")
        ) {
          notifyError(
            "Failed to connect Bitcoin wallet. Please select a P2TR-type address to continue."
          );
        }
        // TODO: might need to add notification for user instruction
        setBitcoinWalletType(null);
      } finally {
        setConnecting(false);
      }
    },
    [solanaPubkey, getBitcoinWallet]
  );

  const handleConnectorId = useCallback(
    async (connectorId: string) => {
      const connector = connectors.find(
        (item) => item.metadata.id === connectorId
      );
      if (!connector) {
        throw new Error(`connector id ${connectorId} not found`);
      }
      setConnectorId(connector.metadata.id);
    },
    [setConnectorId]
  );

  useEffect(() => {
    const onAccountChange = async () => {
      if (!connector) {
        console.error("Connector is not defined");
        return;
      }

      handleDisconnect();
    };

    connector?.on("accountsChanged", onAccountChange);
    return () => {
      connector?.removeListener("accountsChanged", onAccountChange);
    };
  }, [connector, handleDisconnect]);

  useEffect(() => {
    if (accounts.length === 0) {
      if (events.listenerCount(EventName.sendUserOpResult) > 0) {
        events.emit(EventName.sendUserOpResult, {
          error: {
            code: -32600,
            message: "Wallet disconnected",
          },
        });
      } else if (events.listenerCount(EventName.personalSignResult) > 0) {
        events.emit(EventName.personalSignResult, {
          error: {
            code: -32600,
            message: "Wallet disconnected",
          },
        });
      } else if (events.listenerCount(EventName.signTypedDataResult) > 0) {
        events.emit(EventName.signTypedDataResult, {
          error: {
            code: -32600,
            message: "Wallet disconnected",
          },
        });
      }
    }
  }, [accounts]);

  // When user switch account in their solana wallet, we need to disconnect bitcoin wallet because the bitcoin address is derive from their solana address
  if (prevSolanaPubkey !== solanaPubkey && solanaPubkey) {
    setPrevSolanaPubkey(solanaPubkey);
    handleDisconnect();
  }

  if (prevBitcoinNetwork !== bitcoinNetwork) {
    setPrevBitcoinNetwork(bitcoinNetwork);
    handleDisconnect();
  }

  return (
    <BitcoinWalletContext.Provider
      value={{
        wallet: bitcoinWallet,
        connecting,
        connected,
        disconnecting,
        connectConnectorWallet: handleConnectorConnect,
        connectDerivedWallet: handleDerivedWalletConnect,
        disconnect: handleDisconnect,
        signPsbt: handleSignPsbt,

        // Connector Wallet States
        accounts,
        provider,
        disconnectConnector,
        getPublicKey,
        signMessage,
        getNetwork,
        switchNetwork,
        sendBitcoin,
        bitcoinWalletType,
        setBitcoinWalletType,
        connectors,
        connector,
        setConnectorId,
        handleConnectorId,
        connectorId,
      }}
    >
      {children}
    </BitcoinWalletContext.Provider>
  );
}

export function useBitcoinWallet(): BitcoinWalletContextState {
  const context = useContext(BitcoinWalletContext);

  if (!context) {
    throw new Error(
      "useBitcoinWallet must be used within a BitcoinWalletProvider"
    );
  }

  return context;
}
