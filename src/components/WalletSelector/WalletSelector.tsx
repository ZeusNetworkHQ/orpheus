"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import useBitcoinUTXOs from "@/hooks/ares/useBitcoinUTXOs";
import useBalance from "@/hooks/misc/useBalance";
import usePrice from "@/hooks/misc/usePrice";
import usePositions from "@/hooks/zpl/usePositions";
import useStore from "@/stores/store";
import { BTC_DECIMALS, MODAL_NAMES } from "@/utils/constant";
import {
  formatBitcoinAddress,
  formatSolanaAddress,
  formatValue,
} from "@/utils/format";
import { notifyError } from "@/utils/notification";

import Divider from "../Divider";
import Icon from "../Icons";
import { IconName } from "../Icons/icons";
import Modal from "../Modal/Modal";
import Skeleton from "../Skeleton/Skeleton";
import Button from "../WalletButton/Button";

import styles from "./styles.module.scss";

const networks = [
  {
    title: "Solana",
    icon: "solana",
    color: "rgba(178, 131, 255, 0.05)",
  },
  {
    title: "Bitcoin",
    icon: "btc",
    color: "rgba(255, 191, 131, 0.05)",
  },
];

export default function WalletSelector() {
  const currentModal = useStore((state) => state.currentModal);
  const openModalByName = useStore((state) => state.openModalByName);
  const closeGlobalModal = useStore((state) => state.closeModal);

  const {
    wallet: solanaWallet,
    publicKey: solanaPubkey,
    disconnect: disconnectSolanaWallet,
  } = useWallet();
  const {
    wallet: bitcoinWallet,
    connected: bitcoinWalletConnected,
    disconnect: disconnectBitcoinWallet,
    connector,
  } = useBitcoinWallet();

  const { price: btcPrice } = usePrice("BTCUSDC");
  const { data: bitcoinUTXOs, isLoading: isBitcoinUTXOsLoading } =
    useBitcoinUTXOs(bitcoinWallet?.p2tr);
  const { data: zbtcBalance, isLoading: isZbtcBalanceLoading } =
    useBalance(solanaPubkey);
  const { data: positions, isLoading: isPositionsLoading } =
    usePositions(solanaPubkey);

  const [showSolanaMenu, setShowSolanaMenu] = useState(false);
  const [showBitcoinMenu, setShowBitcoinMenu] = useState(false);
  const [prevSolanaPubkey, setPrevSolanaPubkey] = useState<PublicKey | null>(
    solanaPubkey
  );

  const btcBalance =
    bitcoinUTXOs?.reduce(
      (acc, cur) => acc.plus(cur.satoshis),
      new BigNumber(0)
    ) || new BigNumber(0);

  const zbtcBalanceInVault = positions?.reduce(
    (acc, cur) =>
      acc.plus(cur.storedAmount.toString()).minus(cur.frozenAmount.toString()),
    new BigNumber(0)
  );

  const solanaAssetList = [
    {
      title: "zBTC",
      type: "custodian",
      balance: zbtcBalanceInVault?.div(10 ** BTC_DECIMALS),
      value: zbtcBalanceInVault?.div(10 ** BTC_DECIMALS).multipliedBy(btcPrice),
    },

    {
      title: "zBTC",
      type: "non-custodian",
      balance: zbtcBalance.div(10 ** BTC_DECIMALS),
      value: zbtcBalance.div(10 ** BTC_DECIMALS).multipliedBy(btcPrice),
    },
  ];

  const bitcoinAssetList = [
    {
      title: "tBTC",
      type: "non-custodian",
      balance: btcBalance.div(10 ** BTC_DECIMALS),
      value: btcBalance.div(10 ** BTC_DECIMALS).multipliedBy(btcPrice),
    },
  ];

  // NOTE: Disable close wallet selector when onboarding guide
  const closeModal = useCallback(() => {
    setShowSolanaMenu(false);
    setShowBitcoinMenu(false);
    closeGlobalModal();
  }, [closeGlobalModal]);

  const handleDisconnectSolanaWallet = useCallback(() => {
    const action = async () => {
      await disconnectSolanaWallet();
      setShowSolanaMenu(false);
      closeModal();
    };
    action().catch((error) => {
      notifyError(error.message);
    });
  }, [disconnectSolanaWallet, closeModal, setShowSolanaMenu]);

  const handleCopySolanaAddress = () => {
    if (!solanaPubkey) return;
    navigator.clipboard.writeText(solanaPubkey.toBase58() || "");
    setShowSolanaMenu(false);
  };

  const handleCopyBitcoinAddress = () => {
    if (!bitcoinWallet) return;
    navigator.clipboard.writeText(bitcoinWallet.p2tr || "");
    setShowBitcoinMenu(false);
  };

  // NOTE: Disconnect solana wallet when user switch account in wallet extension
  useEffect(() => {
    if (solanaPubkey !== prevSolanaPubkey) {
      setPrevSolanaPubkey(solanaPubkey);
      if (prevSolanaPubkey) {
        handleDisconnectSolanaWallet();
      }
    }
  }, [solanaPubkey, prevSolanaPubkey, handleDisconnectSolanaWallet]);

  return (
    <Modal
      width="450px"
      isOpen={currentModal === MODAL_NAMES.WALLET_SELECTOR}
      isPositioned={true}
      topPosition="80px"
      rightPosition="24px"
      onClose={closeModal}
    >
      <div className={styles.walletSelector}>
        <div className={styles.walletSelector__header}>
          <span>Connected Wallets</span>
          <div
            onClick={() => {
              closeModal();
              setShowBitcoinMenu(false);
              setShowSolanaMenu(false);
            }}
            className="h-[18px] w-[18px] cursor-pointer hover:text-shade-primary"
          >
            <Icon name="Close" />
          </div>
        </div>
        <div className={styles.walletSelector__networks}>
          <div className={styles.walletSelector__networks__list}>
            {networks.map((network) => (
              <div
                key={network.title}
                className={`mask-border ${styles.walletSelector__networks__network} ${showSolanaMenu && network.title === "Bitcoin" ? "opacity-60 blur-[2px]" : ""}`}
                style={{ "--gradient": network.color } as React.CSSProperties}
              >
                <div
                  className={styles.walletSelector__networks__network__header}
                >
                  <div
                    className={
                      styles.walletSelector__networks__network__header__title
                    }
                  >
                    <Icon name={network.icon as IconName} size={18} />
                    <span>{network.title}</span>
                  </div>
                  <div
                    className={
                      styles.walletSelector__networks__network__header__status
                    }
                  >
                    {/* Solana Connect */}
                    {network.title === "Solana" && (
                      <div
                        className={
                          styles.walletSelector__networks__network__header__status__solana
                        }
                        onClick={() => {
                          setShowSolanaMenu(!showSolanaMenu);
                          setShowBitcoinMenu(false);
                        }}
                      >
                        <Button
                          theme="secondary"
                          classes="!max-w-[150px]"
                          label={formatSolanaAddress(solanaPubkey)}
                          icon={
                            <Image
                              src={
                                solanaWallet?.adapter.icon ??
                                "/icons/phantom.svg"
                              }
                              alt="wallet icon"
                              width={16}
                              height={16}
                            />
                          }
                          iconSize={16}
                        />

                        {showSolanaMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.walletSelector__hoverMenu}`}
                          >
                            <div
                              className={
                                styles.walletSelector__hoverMenu__content
                              }
                            >
                              <div
                                className={
                                  styles.walletSelector__hoverMenu__content__item
                                }
                                onClick={() => handleCopySolanaAddress()}
                              >
                                <Icon name="Copy" />
                                <span className="font-medium">
                                  Copy Address
                                </span>
                              </div>
                              <div
                                className={
                                  styles.walletSelector__hoverMenu__content__item
                                }
                                onClick={handleDisconnectSolanaWallet}
                              >
                                <Icon name="Disconnected" />
                                <span>Disconnect</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {network.title === "Bitcoin" && (
                      <div
                        className={
                          styles.walletSelector__networks__network__header__status__solana
                        }
                        onClick={() => {
                          if (bitcoinWalletConnected) {
                            setShowBitcoinMenu(!showBitcoinMenu);
                          } else {
                            openModalByName(MODAL_NAMES.ADD_NEW_WALLET);
                          }
                        }}
                      >
                        <Button
                          theme="secondary"
                          classes="!max-w-[150px]"
                          label={
                            bitcoinWalletConnected
                              ? formatBitcoinAddress(bitcoinWallet?.p2tr)
                              : "Connect"
                          }
                          onClick={() => {
                            if (!bitcoinWalletConnected) {
                              openModalByName(MODAL_NAMES.ADD_NEW_WALLET);
                            }
                          }}
                          icon={
                            bitcoinWalletConnected && (
                              <Image
                                src={
                                  connector
                                    ? connector.metadata.icon
                                    : (solanaWallet?.adapter.icon ?? "")
                                }
                                alt="wallet icon"
                                width={16}
                                height={16}
                              />
                            )
                          }
                          iconSize={16}
                        />

                        {showBitcoinMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.walletSelector__hoverMenu}`}
                          >
                            <div
                              className={
                                styles.walletSelector__hoverMenu__content
                              }
                            >
                              <div
                                className={
                                  styles.walletSelector__hoverMenu__content__item
                                }
                                onClick={() => handleCopyBitcoinAddress()}
                              >
                                <Icon name="Copy" />
                                <span className="font-medium">
                                  Copy Address
                                </span>
                              </div>
                              <div
                                className={
                                  styles.walletSelector__hoverMenu__content__item
                                }
                                onClick={() => {
                                  disconnectBitcoinWallet();
                                  setShowBitcoinMenu(false);
                                }}
                              >
                                <Icon name="Disconnected" />
                                <span>Disconnect</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balances */}
        {
          <>
            <div className={`${styles.walletSelector__balances}`}>
              <div className={styles.walletSelector__balances__header}>
                <span>Balances</span>
              </div>
              <div className={styles.walletSelector__balances__list}>
                {/* zBTC balance */}
                {solanaAssetList.map((asset, index) => (
                  <div key={index} className={`${index === 0 ? "!mt-2" : ""}`}>
                    <div className={styles.walletSelector__balances__asset}>
                      <div
                        className={styles.walletSelector__balances__asset__info}
                      >
                        <div
                          className={
                            styles.walletSelector__balances__asset__info__title
                          }
                        >
                          <Image
                            src={`/icons/${asset.title.toLowerCase()}.svg`}
                            alt={asset.title}
                            width={0}
                            height={0}
                            className="h-auto w-[18px]"
                          />
                          <div
                            className={
                              styles.walletSelector__balances__asset__info__title__text
                            }
                          >
                            <span>{asset.title}</span>
                            {asset.type === "custodian" && (
                              <div
                                className={
                                  styles.walletSelector__balances__asset__info__type
                                }
                              >
                                <Icon name="Lock" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`${styles.walletSelector__balances__asset__balance} !ml-auto`}
                      >
                        <span className="text-shade-primary">
                          {isPositionsLoading && isZbtcBalanceLoading ? (
                            <Skeleton width="100px" height="10px" />
                          ) : (
                            formatValue(asset.balance, 6)
                          )}
                        </span>
                        <span className="text-sm text-shade-mute">
                          {isPositionsLoading && isZbtcBalanceLoading ? (
                            <Skeleton width="100px" height="10px" />
                          ) : (
                            `~$${asset.value}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Btc Balance */}
                {bitcoinWalletConnected && (
                  <>
                    <Divider />
                    {bitcoinAssetList.map((asset, index) => (
                      <div
                        key={index}
                        className={`${index === 0 ? "!mt-2" : ""}`}
                      >
                        <div className={styles.walletSelector__balances__asset}>
                          <div
                            className={
                              styles.walletSelector__balances__asset__info
                            }
                          >
                            <div
                              className={
                                styles.walletSelector__balances__asset__info__title
                              }
                            >
                              <Image
                                src={`/icons/${asset.title.toLowerCase()}.svg`}
                                alt={asset.title}
                                width={0}
                                height={0}
                                className="h-auto w-[18px]"
                              />
                              <div
                                className={
                                  styles.walletSelector__balances__asset__info__title__text
                                }
                              >
                                <span>{asset.title}</span>
                                {asset.type === "custodian" && (
                                  <div
                                    className={
                                      styles.walletSelector__balances__asset__info__type
                                    }
                                  >
                                    <Icon name="Lock" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`${styles.walletSelector__balances__asset__balance} !ml-auto`}
                          >
                            <span className="text-shade-primary">
                              {isBitcoinUTXOsLoading ? (
                                <Skeleton width="100px" height="10px" />
                              ) : (
                                formatValue(asset.balance, 6)
                              )}
                            </span>
                            <span className="text-sm text-shade-mute">
                              {isBitcoinUTXOsLoading ? (
                                <Skeleton width="100px" height="10px" />
                              ) : (
                                `~$${asset.value}`
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </>
        }
      </div>
    </Modal>
  );
}
