import classNames from "classnames";
import { ReactNode } from "react";

import Divider from "@/components/Divider";
import Icon from "@/components/Icons";

import wrapImportant from "../wrapImportant";

export interface TextFieldProps {
  /** Action */
  actionLabel?: ReactNode;
  /** Children */
  children?: ReactNode;
  /** Is Input disabled */
  disabled?: boolean;
  /** Textfield Type */
  type?: "generic" | "amount";
  /** Handle Value Change */
  handleValueChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Is Input invalid */
  invalid?: boolean;
  /** Invalid message */
  invalidMessage?: string;
  /** Action onClick */
  onActionClick?: () => void;
  /** Textfield Placeholder */
  placeholder: string;
  /** Secondary Value for footer */
  secondaryValue?: string;
  /** Value */
  value?: string | number;
  /** Label */
  label?: string;
  /** Show Balance */
  showBalance?: boolean;
  /** Balance Value */
  balanceValue?: string;
  /** Balance Asset */
  balanceAsset?: string;
  /** Show Lock Icon */
  showLockIcon?: boolean;
}

const TextField = ({
  type = "generic",
  placeholder,
  actionLabel,
  children,
  onActionClick,
  disabled = false,
  invalid = false,
  invalidMessage = "An error occurred",
  secondaryValue = "~$0.00",
  value,
  handleValueChange,
  label,
  showBalance = false,
  balanceValue,
  balanceAsset,
  showLockIcon = false,
}: TextFieldProps) => {
  return (
    <div className="flex w-full flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <span className="body-body1-medium text-sys-color-text-secondary">
          {label}
        </span>
        {showBalance && (
          <div className="gap-x-apollo-6 flex items-center">
            <Icon
              name="WalletSmall"
              size={12}
              className="text-sys-color-text-mute"
            />
            <div className="flex items-center gap-x-4">
              <span className="body-body1-medium text-sys-color-text-primary">
                {balanceValue}{" "}
                {balanceAsset && (
                  <span className="text-sys-color-text-mute">
                    {balanceAsset}
                  </span>
                )}
              </span>
              {showLockIcon && (
                <Icon
                  name="Locks"
                  size={14}
                  className="text-sys-color-text-mute"
                />
              )}
            </div>
          </div>
        )}
      </div>
      <div
        className={classNames("group/textfield relative flex w-full", {
          "rounded-12 border-apollo-border-20 bg-sys-color-background-light py-apollo-6 pl-apollo-6 focus-within:border-sys-color-text-mute/60 border pr-16 transition duration-200 ease-in-out focus-within:outline-none":
            type === "amount",
          "border-sys-color-state-error/60": invalid && type === "amount",
          "opacity-40": disabled && type === "amount",
        })}
      >
        {type === "amount" && children}
        <div className="flex w-full flex-col">
          <input
            disabled={disabled}
            className={classNames(
              // General Styles for all textfields
              "bg-sys-color-background-light text-sys-color-text-primary placeholder:text-sys-color-text-mute transition duration-200 ease-in-out",
              {
                // Generic Type Styles
                "body-body1-medium rounded-12 border-apollo-border-20 focus:border-sys-color-text-mute/60 border px-16 py-12 focus:outline-none disabled:opacity-40":
                  type === "generic",
                "border-sys-color-state-error shadow-[inset_0px_0px_16px_rgba(236,70,100,0.25)]":
                  invalid && type === "generic",
                // Amount Type Styles
                "headline-headline4 max-w-[calc(100%-58px)] py-4 pl-16 pr-0 focus:outline-none":
                  type === "amount",
              }
            )}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleValueChange}
          />

          {/* Invalid message for generic input */}
          {type === "generic" && invalid && (
            <div className="body-body2-medium text-sys-color-state-error mt-8 flex w-full items-center justify-end space-x-8">
              <Icon name="NoteSmall" size={12} />
              <span>{invalidMessage}</span>
            </div>
          )}

          {/* Footer value and invalid message */}
          {type === "amount" && (
            <>
              <Divider />
              <div
                className={classNames(
                  "py-apollo-6 pr-apollo-6 flex items-center pl-16"
                )}
              >
                {!invalid ? (
                  <span className="body-body2-medium text-sys-color-text-mute">
                    {secondaryValue}
                  </span>
                ) : (
                  <div className="body-body2-medium text-sys-color-state-error flex items-center space-x-8">
                    <Icon name="NoteSmall" size={12} />
                    <span>{invalidMessage}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {type === "amount" && actionLabel && (
          // Move to separate Component later
          <button
            disabled={disabled}
            className="body-body2-medium gradient-border before:to:transparent rounded-8 bg-apollo-brand-primary-blue text-sys-color-background-normal absolute right-16 top-16 flex h-20 items-center justify-center px-12 shadow-[0px_6px_12px_rgba(255,118,88,0.2),inset_0px_2px_6px_#8DB2F7] before:from-white/40 disabled:opacity-40"
            onClick={onActionClick}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default wrapImportant(TextField);
