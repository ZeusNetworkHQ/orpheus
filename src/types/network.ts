export enum Chain {
  Solana = "Solana",
  Bitcoin = "Bitcoin",
}

export interface NetworkConfig {
  binanceUrl: string;
  aresUrl: string;
  aegleUrl: string;
  hermesUrl: string;
  solanaUrl: string;
  customSolanaUrl: string;
  bitcoinExplorerUrl: string;
  bootstrapperProgramId: string;
  liquidityManagementProgramId: string;
  delegatorProgramId: string;
  twoWayPegProgramId: string;
  bitcoinSpvProgramId: string;
  layerCaProgramId: string;
  guardianSetting: string;
  assetMint: string;
}

export type NetworkConfigMap = Record<string, NetworkConfig>;
