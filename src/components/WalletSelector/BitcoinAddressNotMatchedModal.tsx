import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";

import Button from "../Button/Button";
import Close from "../Icons/Close";
import Modal from "../Modal/Modal";

import styles from "./styles.module.scss";

export default function BitcoinAddressNotMatchedModal() {
  const currentModal = useStore((state) => state.currentModal);
  const openModalByName = useStore((state) => state.openModalByName);

  return (
    <Modal
      width="450px"
      isOpen={currentModal === MODAL_NAMES.BITCOIN_ADDRESS_NOT_MATCHED}
      isPositioned={true}
      onClose={() => {
        openModalByName(MODAL_NAMES.WALLET_SELECTOR);
      }}
      topPosition="40%"
    >
      <div className={styles.wallet__modal__header}>
        <div></div>
        <div className="text-xl font-semibold text-shade-primary">
          Bitcoin Address Not Matched
        </div>

        <div className={styles.wallet__modal__header__close}>
          <button onClick={() => openModalByName(MODAL_NAMES.ADD_NEW_WALLET)}>
            <Close />
          </button>
        </div>
      </div>
      <div className="mx-auto mb-4 mt-4 text-center font-medium">
        The Bitcoin wallet connected in the extension does not match the
        selected one. Please switch to the correct Bitcoin address
      </div>
      <Button
        theme="primary"
        size="lg"
        classes="!w-full"
        label="Reconnect"
        iconPosition="right"
        onClick={() => {
          openModalByName(MODAL_NAMES.ADD_NEW_WALLET);
        }}
      />
    </Modal>
  );
}
