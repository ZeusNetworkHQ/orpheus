"use client";

import useStore from "@/stores/store";

import DevInfoModal from "../DevInfo/DevInfoModal";
import Loader from "../Loader/Loader";
import AddNewWalletModal from "../WalletSelector/AddNewWalletModal";
import ReconnectModal from "../WalletSelector/ReconnectModal";
import WalletSelector from "../WalletSelector/WalletSelector";

export default function GlobalModals() {
  const isGlobalLoaderOpen = useStore((state) => state.isGlobalLoaderOpen);

  return (
    <>
      {isGlobalLoaderOpen && <Loader />}
      <WalletSelector />
      <AddNewWalletModal />
      <DevInfoModal />
      <ReconnectModal />
    </>
  );
}
