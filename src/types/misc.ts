export type EllipsisPosition = "middle" | "end";

export type CryptoInputOption = {
  label: string;
  type: "Custodial" | null;
  amount?: number;
  value?: string;
  icon?: string;
};

export enum CheckBucketResult {
  Activated = "activated",
  Deactivated = "deactivated",
  WrongOwner = "wrong_owner",
  NotFound = "not_found",
  Expired = "expired",
}
