import { IconName } from "@/components/Icons/icons";

export type TransactionDetailsTableItems = {
  label: {
    label: string;
    rightIcon?: IconName;
    leftIcon?: IconName;
    caption?: string;
    info?: string;
  };
  value: {
    label: string;
    rightIcon?: IconName;
    leftIcon?: IconName;
    link?: string;
  };
}[];

export type TransactionDetailsStatusItems = {
  status: "not-started" | "complete" | "pending";
  label: string;
  subLabel?: string;
}[];

export type TransactionDetailsAsset = {
  name: string;
  amount: string;
  isLocked: boolean;
};
