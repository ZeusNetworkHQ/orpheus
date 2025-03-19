import Image from "next/image";

import Icon from "@/components/Icons";
import { IconName } from "@/components/Icons/icons";
import { CryptoInputOption } from "@/types/misc";

import Modal from "../Modal/Modal";

import styles from "./styles.module.scss";

type InputDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  dropdownOptions: CryptoInputOption[];
  changeOption: (option: CryptoInputOption) => void;
};

export default function InputDropdown({
  isOpen,
  onClose,
  dropdownOptions,
  changeOption,
}: InputDropdownProps) {
  return (
    <Modal
      width="150px"
      isOpen={isOpen}
      onClose={onClose}
      isDrawer={false}
      topPosition="80px"
      isCentered={false}
      fixedBackdrop
      isPositioned={true}
      leftPosition="0px"
      cardClasses="!p-[4px] !w-[150px] !rounded-[12px] bg-shade-card"
    >
      <div className={styles.input__group__crypto__dropdown}>
        {dropdownOptions.map((option) => {
          console.log(option);
          return (
            <div
              key={option.label + option.type}
              className={styles.input__group__crypto__dropdown__item}
              onClick={() => {
                changeOption(option);
                onClose();
              }}
            >
              <div
                className={styles.input__group__crypto__dropdown__item__asset}
              >
                <Image
                  src={`/icons/${option.label.toLowerCase()}.svg`}
                  alt={`${option.label} Icon`}
                  width={20}
                  height={20}
                />
                <div
                  className={
                    styles.input__group__crypto__dropdown__item__asset__label
                  }
                >
                  <div
                    className={
                      styles.input__group__crypto__dropdown__item__asset__label__name
                    }
                  >
                    {option.label}
                    <Icon name={option.icon as IconName} size={14} />
                  </div>
                  {option.type && (
                    <span
                      className={
                        styles.input__group__crypto__dropdown__item__asset__label__type
                      }
                    >
                      {option.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
