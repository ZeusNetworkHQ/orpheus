import * as borsh from "@coral-xyz/borsh";
/** @type {import('next').NextConfig} */
import { Connection, PublicKey } from "@solana/web3.js";

const bootstrapSchema = borsh.struct([
  borsh.publicKey("superOperatorCertificate"),
  borsh.publicKey("chadbufferProgramId"),
  borsh.publicKey("bitcoinSpvProgramId"),
  borsh.publicKey("twoWayPegProgramId"),
  borsh.publicKey("liquidityManagementProgramId"),
  borsh.publicKey("delegatorProgramId"),
  borsh.publicKey("layerCaProgramId"),
]);

const guardianSettingSchema = borsh.struct([
  borsh.u32("seed"),
  borsh.publicKey("guardianCertificate"),
  borsh.publicKey("assetMint"),
  borsh.publicKey("tokenProgramId"),
  borsh.publicKey("splTokenMintAuthority"),
  borsh.publicKey("splTokenBurnAuthority"),
]);

async function getZplProgramIds(boostrapperProgramId, connection) {
  const bootstrapAccounts = await connection.getProgramAccounts(
    new PublicKey(boostrapperProgramId)
  );
  const bootstrapAccountData = bootstrapAccounts[0].account.data;
  const bootstrapData = bootstrapSchema.decode(bootstrapAccountData);

  const twoWayPegProgramId = bootstrapData.twoWayPegProgramId.toBase58();
  const liquidityManagementProgramId =
    bootstrapData.liquidityManagementProgramId.toBase58();

  const delegatorProgramId = bootstrapData.delegatorProgramId.toBase58();
  const bitcoinSpvProgramId = bootstrapData.bitcoinSpvProgramId.toBase58();
  const layerCaProgramId = bootstrapData.layerCaProgramId.toBase58();

  return {
    twoWayPegProgramId,
    liquidityManagementProgramId,
    delegatorProgramId,
    bitcoinSpvProgramId,
    layerCaProgramId,
  };
}

async function getAssetMint(guardianSettingAccountAddress, connection) {
  const guardianSettingAccount = await connection.getAccountInfo(
    new PublicKey(guardianSettingAccountAddress)
  );

  const guardianSettingsAccountData = guardianSettingSchema.decode(
    guardianSettingAccount.data.subarray(8)
  );

  return guardianSettingsAccountData.assetMint.toBase58();
}

const nextConfig = async () => {
  const config = {
    experimental: {
      missingSuspenseWithCSRBailout: false,
    },
    reactStrictMode: false,
    webpack: function (config, options) {
      if (options.nextRuntime === "edge") {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          crypto: "crypto-browserify",
        };
      }
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
      config.experiments = {
        asyncWebAssembly: true,
        topLevelAwait: true,
        layers: true,
      };
      return config;
    },
    env: {
      CF_PAGES_COMMIT_SHA: process.env.CF_PAGES_COMMIT_SHA,
    },
  };

  if (process.env.GITHUB_ACTIONS) {
    return config;
  }

  const devnetConnection = new Connection(
    process.env.SOLANA_DEVNET_RPC ?? "https://api.devnet.solana.com"
  );
  const devnetBootstrapperProgramId =
    process.env.NEXT_PUBLIC_DEVNET_BOOTSTRAPPER_PROGRAM_ID;

  const {
    twoWayPegProgramId: devnetTwoWayPegProgramId,
    liquidityManagementProgramId: devnetLiquidityManagementProgramId,
    delegatorProgramId: devnetDelegatorProgramId,
    layerCaProgramId: devnetLayerCaProgramId,
    bitcoinSpvProgramId: devnetBitcoinSpvProgramId,
  } = await getZplProgramIds(devnetBootstrapperProgramId, devnetConnection);

  const regtestAssetMint = await getAssetMint(
    process.env.NEXT_PUBLIC_REGTEST_DEVNET_TWO_WAY_PEG_GUARDIAN_SETTING,
    devnetConnection
  );

  return {
    ...config,
    env: {
      NEXT_PUBLIC_DEVNET_BOOSTRAPPER_PROGRAM_ID: devnetBootstrapperProgramId,
      NEXT_PUBLIC_DEVNET_LIQUIDITY_MANAGEMENT_PROGRAM_ID:
        devnetLiquidityManagementProgramId,
      NEXT_PUBLIC_DEVNET_DELEGATOR_PROGRAM_ID: devnetDelegatorProgramId,
      NEXT_PUBLIC_DEVNET_TWO_WAY_PEG_PROGRAM_ID: devnetTwoWayPegProgramId,
      NEXT_PUBLIC_DEVNET_LAYER_CA_PROGRAM_ID: devnetLayerCaProgramId,
      NEXT_PUBLIC_DEVNET_BITCOIN_SPV_PROGRAM_ID: devnetBitcoinSpvProgramId,
      NEXT_PUBLIC_REGTEST_ASSET_MINT: regtestAssetMint,
    },
  };
};

export default nextConfig();
