import Image from "next/image";
import { useState } from "react";

import Icon from "@/components/Icons";
import { CryptoInputOption } from "@/types/misc";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";

import Divider from "../Divider";
import Button from "../WalletButton/Button";

import InputDropdown from "./Dropdown";
import styles from "./styles.module.scss";

type CryptoInputProps = {
  hasActions?: boolean;
  isDisabled?: boolean;
  placeholder?: number;
  setAmount?: (amount: string) => void;
  min?: number;
  max?: number;
  value?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  handleErrorMessage?: (message: string) => void;
  fiatValue?: string;
  classes?: string;
  currentOption: CryptoInputOption;
  dropdownOptions?: CryptoInputOption[];
  changeOption?: (option: CryptoInputOption) => void;
  decimals?: number;
};

function calcInputValue(inputValue: string, decimals: number) {
  // Handle multiple decimal points
  const parts = inputValue.split(".");
  if (parts.length > 2) {
    inputValue = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal
  if (parts.length === 2 && parts[1].length > decimals) {
    inputValue = parts[0] + "." + parts[1].slice(0, decimals);
  }

  return inputValue;
}

export default function CryptoInput({
  hasActions = false,
  isDisabled = false,
  placeholder = 0,
  setAmount,
  fiatValue = "0",
  min,
  max,
  errorMessage,
  value,
  isInvalid,
  handleErrorMessage,
  classes,
  currentOption,
  dropdownOptions,
  changeOption,
  decimals = BTC_DECIMALS,
}: CryptoInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const displayOptions = dropdownOptions?.filter(
    (option) =>
      option.label !== currentOption?.label ||
      option.type !== currentOption?.type
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    decimals: number
  ) => {
    let inputValue = e.target.value;
    console.log("inputValue = ", inputValue);

    // Only allow non-negative numbers and decimal points
    if (/^\d*\.?\d*$/.test(inputValue)) {
      // Handle the case where the decimal point starts with "." (e.g. ".5")
      if (inputValue.startsWith(".")) {
        inputValue = "0" + inputValue;
      }

      inputValue = calcInputValue(inputValue, decimals);

      if (parseFloat(inputValue) === 0) {
        handleErrorMessage?.("Invalid amount");
      } else if (max !== undefined && parseFloat(inputValue) > max) {
        handleErrorMessage?.("Value exceeds your balance");
      } else if (min !== undefined && parseFloat(inputValue) < min) {
        handleErrorMessage?.(`Value must be greater than ${min}`);
      } else {
        handleErrorMessage?.("");
      }

      console.log("inputValue after calc = ", inputValue);
      setAmount?.(inputValue);
    }
  };

  return (
    <div
      className={`${styles.input__group} ${isInvalid ? styles.input__group__invalid : ""} ${isFocused ? "focused" : ""}  ${classes}`}
    >
      <div className="group relative flex w-[150px] flex-shrink-0 transition sm:w-auto">
        <div
          className={`${dropdownOptions ? "hover:!shadow-[0px_4px_4px_rgba(199, 217, 254,0.5),inset_0px_2px_15px_rgba(139,138,158,0.5)] cursor-pointer hover:!border-shade-mute/50" : ""} ${styles.input__group__crypto} ${dropdownOptions && showDropdown ? "relative !z-50" : ""}`}
          onClick={() => {
            if (!dropdownOptions) return;
            setShowDropdown(true);
          }}
        >
          <Image
            src={`/icons/${currentOption?.label.toLowerCase()}.svg`}
            alt={`${currentOption?.label} Icon`}
            width={20}
            height={20}
          />
          <div className={styles.input__group__crypto__label}>
            <div className={styles.input__group__crypto__label__asset}>
              <div>{currentOption.label}</div>
              {currentOption?.type === "Custodial" && <Icon name="Lock" />}
            </div>
            {currentOption?.type && (
              <span className={styles.input__group__crypto__label__type}>
                {currentOption?.type}
              </span>
            )}
          </div>
          {dropdownOptions && (
            <div className="!ml-auto flex-shrink-0">
              <Icon
                name="ChevronDown"
                className="text-shade-secondary transition group-hover:text-shade-primary"
                size={12}
              />
            </div>
          )}
        </div>
        {displayOptions && changeOption && (
          <InputDropdown
            isOpen={showDropdown}
            onClose={() => setShowDropdown(false)}
            dropdownOptions={displayOptions}
            changeOption={changeOption}
          />
        )}
      </div>

      <div className={styles.input__group__input}>
        <div className={styles.input__group__input__top}>
          <input
            maxLength={16}
            className={styles.input__group__input__field}
            placeholder={formatValue(placeholder, decimals)}
            disabled={isDisabled}
            onChange={(e) => {
              handleChange(e, decimals);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={value || ""}
          />
          {hasActions && (
            <div className={styles.input__group__actions}>
              <Button
                size="xs"
                classes="flex items-center justify-center !w-max flex-shrink-0 right-2"
                theme="primary"
                label="Max"
                onClick={() => {
                  if (!max) return;
                  handleErrorMessage?.("");

                  const inputValue = calcInputValue(max.toString(), decimals);
                  const val = Number(inputValue);

                  if (min && val < min) {
                    handleErrorMessage?.(`Value must be greater than ${min}`);
                  }

                  setAmount?.(formatValue(val, decimals));
                }}
              />
            </div>
          )}
        </div>
        <Divider />
        <div
          className={`${errorMessage && "!text-[#FF4646]"} ${styles.input__group__input__fiat}`}
        >
          {errorMessage && <Icon name="Error" />}
          <span>{errorMessage || `~$${fiatValue} USD`}</span>
        </div>
      </div>
    </div>
  );
}
