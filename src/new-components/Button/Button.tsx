import { Icon, IconName } from "@zeus-network/design-system/components";
import classNames from "classnames";

import ButtonLoader from "../Loaders/ButtonLoader";
import wrapImportant from "../wrapImportant";

export interface ButtonProps {
  /** Button Label */
  label: string;
  /** Button Type */
  type: "primary" | "secondary";
  /** Button Size */
  size?: "small" | "medium" | "large";
  /** Button Icon */
  icon?: IconName;
  /** Button Icon Position */
  iconPosition?: "left" | "right";
  /** Button On Click */
  onClick?: () => void;
  /** Button Disabled */
  disabled?: boolean;
  /** Hide Label */
  hideLabel?: boolean;
  /** Custom ClassNames */
  className?: string;
  /** Is Loading */
  isLoading?: boolean;
}

const Button = ({
  label,
  type,
  size = "medium",
  icon,
  iconPosition = "left",
  onClick,
  disabled,
  hideLabel,
  className,
  isLoading = false,
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      type="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      className={classNames(
        "gradient-border body-body1-medium before:gradient-border-b relative flex items-center justify-center gap-x-8 transition duration-200 ease-in-out",
        {
          // Primary Styles
          "bg-apollo-brand-primary-orange text-ref-palette-grey-60a shadow-[0px_6px_12px_rgba(255,118,88,0.2),inset_0px_2px_6px_#FF9A84] before:from-white/40 before:content-[''] enabled:hover:shadow-[0px_8px_12px_rgba(255,118,88,0.2),inset_0px_2px_6px_#FF9A84] disabled:opacity-40":
            type === "primary",

          // Secondary Styles
          "bg-sys-color-card-light text-sys-color-text-primary before:from-sys-color-text-mute/40 before:via-apollo-border-15 before:to-apollo-border-15 shadow-[inset_0px_-4px_4px_rgba(139,138,158,0.12)] enabled:hover:shadow-[inset_0px_-4px_8px_rgba(139,138,158,0.2),inset_0px_-4px_4px_rgba(139,138,158,0.12)] disabled:opacity-40":
            type === "secondary",
          "!text-sys-color-text-secondary enabled:hover:!text-sys-color-text-primary":
            type === "secondary" && hideLabel,

          // Sizes
          "py-apollo-6 rounded-[10px] px-12": size === "small",
          "rounded-[10px] px-12 py-8": size === "medium",
          "rounded-12 px-20 py-12": size === "large",
          "h-[40px] w-[40px] !rounded-[10px] !p-0": hideLabel,

          // Custom ClassName
        },
        className
      )}
    >
      {isLoading && <ButtonLoader />}
      {!isLoading && icon && iconPosition === "left" && (
        <Icon name={icon} size={18} />
      )}
      {!isLoading && !hideLabel && <span>{label}</span>}
      {!isLoading && icon && iconPosition === "right" && (
        <Icon name={icon} size={18} />
      )}
    </button>
  );
};

export default wrapImportant(Button);
