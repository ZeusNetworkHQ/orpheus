import * as borsh from "@coral-xyz/borsh";
import { withSentryConfig } from "@sentry/nextjs";
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

  if (process.env.GITHUB_ACTIONS || process.env.IS_STORYBOOK) {
    return config;
  }

  // Regtest-Devnet
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

  // Testnet-Devnet
  const testnetAssetMint = await getAssetMint(
    process.env.NEXT_PUBLIC_TESTNET_DEVNET_TWO_WAY_PEG_GUARDIAN_SETTING,
    devnetConnection
  );

  // Mainnet
  const mainnetConnection = new Connection(
    process.env.SOLANA_MAINNET_RPC ?? "https://api.mainnet-beta.solana.com"
  );
  const mainnetBootstrapperProgramId =
    process.env.NEXT_PUBLIC_MAINNET_BOOTSTRAPPER_PROGRAM_ID;

  const {
    twoWayPegProgramId: mainnetTwoWayPegProgramId,
    liquidityManagementProgramId: mainnetLiquidityManagementProgramId,
    delegatorProgramId: mainnetDelegatorProgramId,
    layerCaProgramId: mainnetLayerCaProgramId,
    bitcoinSpvProgramId: mainnetBitcoinSpvProgramId,
  } = await getZplProgramIds(mainnetBootstrapperProgramId, mainnetConnection);

  const mainnetAssetMint = await getAssetMint(
    process.env.NEXT_PUBLIC_MAINNET_TWO_WAY_PEG_GUARDIAN_SETTING,
    mainnetConnection
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
      NEXT_PUBLIC_TESTNET_ASSET_MINT: testnetAssetMint,

      NEXT_PUBLIC_MAINNET_BOOSTRAPPER_PROGRAM_ID: mainnetBootstrapperProgramId,
      NEXT_PUBLIC_MAINNET_LIQUIDITY_MANAGEMENT_PROGRAM_ID:
        mainnetLiquidityManagementProgramId,
      NEXT_PUBLIC_MAINNET_DELEGATOR_PROGRAM_ID: mainnetDelegatorProgramId,
      NEXT_PUBLIC_MAINNET_TWO_WAY_PEG_PROGRAM_ID: mainnetTwoWayPegProgramId,
      NEXT_PUBLIC_MAINNET_LAYER_CA_PROGRAM_ID: mainnetLayerCaProgramId,
      NEXT_PUBLIC_MAINNET_BITCOIN_SPV_PROGRAM_ID: mainnetBitcoinSpvProgramId,
      NEXT_PUBLIC_MAINNET_ASSET_MINT: mainnetAssetMint,
    },
  };
};

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

export default SENTRY_AUTH_TOKEN
  ? withSentryConfig(await nextConfig(), {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      org: "zeus-network",
      project: "apollo",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      // tunnelRoute: "/monitoring",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,

      authToken: SENTRY_AUTH_TOKEN,
    })
  : nextConfig();
