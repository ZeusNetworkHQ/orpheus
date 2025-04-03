import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

import Icon from "@/components/Icons";
import { useBitcoinWallet } from "@/contexts/BitcoinWalletProvider";
import useHotReserveBucketActions from "@/hooks/zpl/useHotReserveBucketActions";
import usePersistentStore from "@/stores/persistentStore";
import useStore from "@/stores/store";
import { CheckBucketResult } from "@/types/misc";
import { MODAL_NAMES } from "@/utils/constant";
import { shortenString } from "@/utils/format";

import Modal from "../Modal/Modal";
import Button from "../WalletButton/Button";

function ReconnectModal() {
  const currentModal = useStore((state) => state.currentModal);
  const openModalByName = useStore((state) => state.openModalByName);
  const closeModal = useStore((state) => state.closeModal);
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const {
    wallet: bitcoinWallet,
    connector,
    disconnectConnector,
    disconnect: disconnectBitcoinWallet,
  } = useBitcoinWallet();
  const { publicKey: solanaPubkey, disconnect: disconnectSolanaWallet } =
    useWallet();
  const { setVisible: setShowSolanaModal } = useWalletModal();
  const { checkHotReserveBucketStatus } =
    useHotReserveBucketActions(bitcoinWallet);
  const [bucketOwner, setBucketOwner] = useState("");

  useEffect(() => {
    checkHotReserveBucketStatus().then((result) => {
      if (result?.status === CheckBucketResult.WrongOwner) {
        setBucketOwner(result?.owner ?? "");
        openModalByName(MODAL_NAMES.RECONNECT_MODAL);
        disconnectConnector();
        disconnectBitcoinWallet();
      }
    });
  }, [
    bitcoinWallet,
    bitcoinNetwork,
    connector,
    solanaPubkey,
    disconnectBitcoinWallet,
    disconnectConnector,
    disconnectSolanaWallet,
    checkHotReserveBucketStatus,
    openModalByName,
  ]);

  const handleCloseModal = () => {
    closeModal();
    disconnectSolanaWallet();
  };

  return (
    <Modal
      width="450px"
      isOpen={currentModal === MODAL_NAMES.RECONNECT_MODAL}
      isCentered
      animateFrom={null}
      fixedBackdrop
      onClose={handleCloseModal}
    >
      <div className="relative">
        <div
          onClick={handleCloseModal}
          className="absolute right-0 top-0 h-[18px] w-[18px] cursor-pointer hover:text-shade-primary"
        >
          <Icon name="Close" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="max-w-[75%] text-center text-xl font-semibold text-shade-primary">
          Solana Address Not Matched
        </div>
        <div className="mb-4 mt-4 text-center text-base font-medium">
          This Bitcoin account is already paired to the Solana wallet address
          shown below. Please switch to that address to continue:
        </div>
        <div className="mb-6 flex items-center gap-2 text-center font-medium">
          <Icon name="Sol" />
          {shortenString(bucketOwner)}
        </div>
        <Button
          theme="primary"
          size="lg"
          classes="!w-full"
          label="Reconnect"
          iconPosition="right"
          onClick={() => {
            handleCloseModal();
            setShowSolanaModal(true);
          }}
        />
      </div>
    </Modal>
  );
}

export default ReconnectModal;
