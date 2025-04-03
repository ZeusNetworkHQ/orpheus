export const MODAL_NAMES = {
  WALLET_SELECTOR: "walletSelector",
  ADD_NEW_WALLET: "addNewWallet",
  DEV_INFO_MODAL: "devInfoModal",
  ENDPOINT_SELECTOR: "endpointSelector",
  USER_SETTINGS: "userSettings",
  MOBILE_MENU: "mobileMenu",
  SUCCESSFUL_CLAIM: "successfulClaim",
  RECONNECT_MODAL: "reconnectModal",
};

export const ZEUS_SCAN_URL = process.env.NEXT_PUBLIC_ZEUS_SCAN_URL ?? "";

export const BTC_DECIMALS = 8;
export const ZEUS_DECIMALS = 6;
export const SAFETY_RATIO = 20000;

export const SECONDS_PER_DAY = 86400;
export const HOT_RESERVE_BUCKET_VALIDITY_PERIOD = 7 * SECONDS_PER_DAY;

export const SOLANA_TX_FEE_IN_LAMPORT = 5000;

export const SOLANA_TX_FEE_IN_SOL = SOLANA_TX_FEE_IN_LAMPORT / 1e9;

export const DEFAULT_SERVICE_FEE_BASIS_POINT_PERCENT = 5 / 100; // 5% for testnet & regtest

export const DEFAULT_LAYER_FEE = 0.05; // 0.05 SOL

export const LINK_TYPE = {
  BITCOIN: "bitcoin",
  SOLANA: "solana",
  API: "api",
  NULL: null,
};
