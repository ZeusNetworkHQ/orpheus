"use client";

import ReceivedZBTCModal from "@/components/Mint/Modals/ReceivedZBTC";
import useStore from "@/stores/store";

import DevInfoModal from "../DevInfo/DevInfoModal";
import Loader from "../Loader/Loader";
import AddNewWalletModal from "../WalletSelector/AddNewWalletModal";
import BitcoinAddressNotMatchedModal from "../WalletSelector/BitcoinAddressNotMatchedModal";
import ReconnectModal from "../WalletSelector/ReconnectModal";
import WalletSelector from "../WalletSelector/WalletSelector";

export default function GlobalModals() {
  const isGlobalLoaderOpen = useStore((state) => state.isGlobalLoaderOpen);

  return (
    <>
      {isGlobalLoaderOpen && <Loader />}
      <WalletSelector />
      <AddNewWalletModal />
      <BitcoinAddressNotMatchedModal />
      <DevInfoModal />
      <ReconnectModal />
      <ReceivedZBTCModal />
    </>
  );
}
