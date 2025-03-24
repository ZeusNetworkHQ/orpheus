import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { checkWalletAvailability, Wallet } from "@/bitcoin/wallet";
import { BaseConnector } from "@/connector";
import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import usePersistentStore from "@/stores/persistentStore";
import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";
import { notifyError } from "@/utils/notification";

import Icon from "../Icons";
import ButtonLoader from "../Icons/icons/ButtonLoader";
import Modal from "../Modal/Modal";

import styles from "./styles.module.scss";

const getDefaultSelectedWallet = (
  connector: BaseConnector | undefined,
  regtestWallets: Wallet[],
  testnetWallets: Wallet[],
  networkType: string
) => {
  if (!connector) {
    return 0;
  }

  const wallets = {
    regtest: regtestWallets,
    testnet: testnetWallets,
  }[networkType];

  if (!wallets) {
    throw new Error(`Invalid network type ${networkType}`);
  }

  return wallets.findIndex((wallet) => wallet.id === connector.metadata.id);
};

export default function AddNewWalletModal() {
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const currentModal = useStore((state) => state.currentModal);
  const openModalByName = useStore((state) => state.openModalByName);

  const { wallet: solanaWallet } = useWallet();
  const {
    connectConnectorWallet,
    connectDerivedWallet,
    connected: bitcoinWalletConnected,
    handleConnectorId,
    connectors,
    connector,
  } = useBitcoinWallet();

  const [isConnecting, setIsConnecting] = useState(false);
  const [walletDetection, setWalletDetection] = useState(
    checkWalletAvailability
  );

  const bitcoinDevnetWallet = {
    id: solanaWallet?.adapter.name,
    title: "Bitcoin Devnet Wallet",
    icon: solanaWallet?.adapter.icon || "/icons/phantom.svg",
    type: "solana",
    isDetected: solanaWallet?.adapter.readyState === WalletReadyState.Installed,
    url: solanaWallet?.adapter.url,
  } as Wallet;

  const regtestWallets = [
    bitcoinDevnetWallet,
    {
      id: "muses",
      title: "Muses Wallet",
      icon: "muses",
      type: "connector" as const,
      isDetected: walletDetection.muses,
      url: "https://chromewebstore.google.com/detail/muses-wallet-for-apollo-t/eidehbdehdaggoophgjhkplcbjhelfkc",
    },
  ];

  const testnetWallets = [bitcoinDevnetWallet];

  const [selectedWallet, setSelectedWallet] = useState(
    getDefaultSelectedWallet(
      connector,
      regtestWallets,
      testnetWallets,
      bitcoinNetwork
    )
  );

  const wallets = {
    regtest: regtestWallets,
    testnet: testnetWallets,
  }[bitcoinNetwork.toLocaleLowerCase()] as Wallet[];

  const closeModal = () => {
    setIsConnecting(false);
    openModalByName(MODAL_NAMES.WALLET_SELECTOR);
  };

  const onConnectorConnect = async (
    wallet: Wallet,
    connector: BaseConnector
  ) => {
    setIsConnecting(true);
    if (connector?.isReady() && wallet?.type === "connector") {
      await handleConnectorId(connector.metadata.id);
    }
    try {
      await connectConnectorWallet(connector);
      setIsConnecting(false);
      closeModal();
    } catch (error) {
      const walletError = error as { code: number };
      if (walletError?.code === 4001) {
        notifyError(
          "You must have at least one account in the Bitcoin wallet."
        );
      }
      setIsConnecting(false);
    }
  };

  const onDerivedWalletConnect = async () => {
    setIsConnecting(true);
    try {
      await connectDerivedWallet();
      setIsConnecting(false);
      closeModal();
    } catch (error) {
      console.error("onDerivedWalletConnect error", error);
      setIsConnecting(false);
    }
  };

  const connectWallet = async (wallet: Wallet & { originalIndex: number }) => {
    if (wallet.type === "connector") {
      const connector = connectors.find(
        (item) => item.metadata.id === wallet.id
      );
      if (connector?.isReady()) {
        await onConnectorConnect(wallet, connector);
      } else {
        window.open(wallet.url, "_blank");
      }
    } else {
      onDerivedWalletConnect();
    }
  };

  useEffect(() => {
    const checkWallets = () => {
      setWalletDetection(checkWalletAvailability());
    };

    checkWallets();

    const interval = setInterval(checkWallets, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Modal
      width="400px"
      isOpen={currentModal === MODAL_NAMES.ADD_NEW_WALLET}
      isPositioned={true}
      isCentered={true}
      cardClasses="!pt-5 !pb-3 !px-3"
      onClose={closeModal}
    >
      <div className={`${styles.wallet__modal__header} pl-2 pr-1`}>
        <div className={styles.wallet__modal__header__title}>
          <span>Connect a Bitcoin Wallet</span>
        </div>
        <div className={styles.wallet__modal__header__close}>
          <button onClick={closeModal}>
            <Icon name="Close" />
          </button>
        </div>
      </div>

      <div className={styles.wallet__modal__walletList}>
        {wallets
          .map((wallet, index) => ({ ...wallet, originalIndex: index }))
          .sort((a, b) =>
            a.isDetected === b.isDetected ? 0 : a.isDetected ? -1 : 1
          )
          .map((wallet) => (
            <div
              key={wallet.title}
              className={styles.wallet__modal__walletList__item}
              onClick={() => {
                if (!wallet.isDetected)
                  return window.open(wallet.url, "_blank");

                setSelectedWallet(wallet.originalIndex);

                if (!bitcoinWalletConnected) {
                  if (wallet.id) {
                    connectWallet(wallet as Wallet & { originalIndex: number });
                  } else {
                    console.error("Wallet ID is undefined");
                  }
                }
              }}
            >
              <div className={styles.wallet__modal__walletList__item__icon}>
                <Image
                  src={
                    wallet.type === "solana"
                      ? wallet.icon
                      : `/icons/${wallet.icon}.svg`
                  }
                  alt={wallet.title}
                  width={18}
                  height={18}
                />
                <span>{wallet.title}</span>
              </div>
              {isConnecting && selectedWallet === wallet.originalIndex && (
                <ButtonLoader />
              )}
              {!isConnecting && (
                <div
                  className={`${styles.wallet__modal__walletList__item__status}`}
                >
                  {wallet.isDetected ? "Detected" : "Install"}
                </div>
              )}
            </div>
          ))}
      </div>
    </Modal>
  );
}
