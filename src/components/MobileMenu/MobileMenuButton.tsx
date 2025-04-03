import Icon from "@/components/Icons";
import useStore from "@/stores/store";
import { MODAL_NAMES } from "@/utils/constant";

import styles from "./styles.module.scss";

export default function MobileMenuButton() {
  const currentModal = useStore((state) => state.currentModal);
  const openModalByName = useStore((state) => state.openModalByName);
  const closeModal = useStore((state) => state.closeModal);

  return (
    <div className="flex items-center space-x-2">
      <div
        onClick={() => {
          console.log(currentModal);
          if (currentModal === MODAL_NAMES.MOBILE_MENU) {
            closeModal();
          } else {
            openModalByName(MODAL_NAMES.MOBILE_MENU);
          }
        }}
        className={`${styles.bell}`}
      >
        <Icon name="Burger" />
      </div>
    </div>
  );
}
