import classNames from "classnames";

import Icon from "@/components/Icons";
import { IconName } from "@/components/Icons/icons";

export interface ChipProps {
  /** Size */
  size?: "small" | "medium" | "large";
  /** Icon */
  icon?: IconName;
  /** Label */
  label: string;
  /** Custom classNames */
  className?: string;
}

const Chip = ({ size = "medium", icon, label, className }: ChipProps) => {
  return (
    <div
      className={classNames(
        "bg-ref-palette-opacity-cold-grey-10 text-sys-color-text-secondary flex items-center gap-x-4 rounded-full",
        {
          "py-apollo-6 body-body1-medium px-12": size === "large",
          "body-body2-medium px-12 py-4": size === "medium",
          "caption-caption px-8 py-[2px]": size === "small",
        },
        className
      )}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{label}</span>
    </div>
  );
};

export default Chip;
