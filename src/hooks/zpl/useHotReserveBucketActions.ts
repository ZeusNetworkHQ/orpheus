import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback } from "react";
import { deriveHotReserveAddress } from "zpl-sdk-js/bitcoin";
import { HotReserveBucketStatus } from "zpl-sdk-js/two-way-peg/types";

import { convertBitcoinNetwork, UNLOCK_BLOCK_HEIGHT } from "@/bitcoin";
import { getInternalXOnlyPubkeyFromUserWallet } from "@/bitcoin/wallet";
import { useZplClient } from "@/contexts/ZplClientProvider";
import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import usePersistentStore from "@/stores/persistentStore";
import { CheckBucketResult } from "@/types/misc";
import { Chain } from "@/types/network";
import { BitcoinWallet } from "@/types/wallet";
import { createAxiosInstances } from "@/utils/axios";
import { HOT_RESERVE_BUCKET_VALIDITY_PERIOD } from "@/utils/constant";
import { notifyTx } from "@/utils/notification";

import useTwoWayPegGuardianSettings from "../hermes/useTwoWayPegGuardianSettings";

import useColdReserveBuckets from "./useColdReserveBuckets";

const useHotReserveBucketActions = (bitcoinWallet: BitcoinWallet | null) => {
  const solanaNetwork = usePersistentStore((state) => state.solanaNetwork);
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);
  const zplClient = useZplClient();
  const networkConfig = useNetworkConfig();
  const { publicKey: solanaPubkey } = useWallet();

  const { data: twoWayPegGuardianSettings } = useTwoWayPegGuardianSettings();
  const { data: coldReserveBuckets } = useColdReserveBuckets();

  const createHotReserveBucket = useCallback(async () => {
    if (!zplClient || !bitcoinWallet || !solanaPubkey) return;

    const selectedGuardian = twoWayPegGuardianSettings[0];

    const coldReserveBucket = coldReserveBuckets.find(
      (bucket) => bucket.reserveSetting.toBase58() === selectedGuardian.address
    );

    if (!coldReserveBucket)
      throw new Error("Cold Reserve Bucket not found for the guardian setting");

    const guardianXOnlyPublicKey = Buffer.from(
      coldReserveBucket.keyPathSpendPublicKey
    );

    const userBitcoinXOnlyPublicKey =
      getInternalXOnlyPubkeyFromUserWallet(bitcoinWallet);

    if (!userBitcoinXOnlyPublicKey)
      throw new Error("Can't get x-only publickey");

    const { pubkey: hotReserveBitcoinXOnlyPublicKey } = deriveHotReserveAddress(
      guardianXOnlyPublicKey,
      userBitcoinXOnlyPublicKey,
      UNLOCK_BLOCK_HEIGHT,
      convertBitcoinNetwork(bitcoinNetwork)
    );

    if (!hotReserveBitcoinXOnlyPublicKey)
      throw new Error("Can't get hot reserve x-only publickey");

    const twoWayPegConfiguration =
      await zplClient.twoWayPeg.accounts.getConfiguration();

    const ix = zplClient.twoWayPeg.instructions.buildCreateHotReserveBucketIx(
      UNLOCK_BLOCK_HEIGHT,
      HOT_RESERVE_BUCKET_VALIDITY_PERIOD,
      solanaPubkey,
      userBitcoinXOnlyPublicKey,
      hotReserveBitcoinXOnlyPublicKey,
      new PublicKey(selectedGuardian.address),
      new PublicKey(selectedGuardian.guardian_certificate),
      coldReserveBucket.publicKey,
      twoWayPegConfiguration.layerFeeCollector
    );

    const sig = await zplClient.signAndSendTransactionWithInstructions([ix]);

    notifyTx(true, {
      chain: Chain.Solana,
      txId: sig,
      solanaNetwork: solanaNetwork,
    });

    // NOTE: create hot reserve address in cobo so that zeus node can unlock the hot reserve utxo faster (not necessary so catch the error)
    const { aegleApi } = createAxiosInstances(solanaNetwork, bitcoinNetwork);
    aegleApi
      .post(
        `/api/v1/cobo-address`,
        {
          type: "hotReserveBucket",
          hotReserveBucketPda: zplClient.twoWayPeg.pdas
            .deriveHotReserveBucketAddress(hotReserveBitcoinXOnlyPublicKey)
            .toBase58(),
          coldReserveBucketPda: coldReserveBucket.publicKey.toBase58(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .catch((e) => console.error(e));
  }, [
    zplClient,
    solanaPubkey,
    bitcoinWallet,
    bitcoinNetwork,
    solanaNetwork,
    coldReserveBuckets,
    twoWayPegGuardianSettings,
  ]);

  const reactivateHotReserveBucket = useCallback(async () => {
    if (!zplClient || !solanaPubkey) return;

    const userBitcoinXOnlyPublicKey =
      getInternalXOnlyPubkeyFromUserWallet(bitcoinWallet);

    if (!userBitcoinXOnlyPublicKey) return;

    const hotReserveBuckets =
      await zplClient.twoWayPeg.accounts.getHotReserveBucketsByBitcoinXOnlyPubkey(
        userBitcoinXOnlyPublicKey
      );

    if (hotReserveBuckets.length === 0) return;

    const targetHotReserveBucket = hotReserveBuckets.find(
      (bucket) =>
        bucket.reserveSetting.toBase58() === networkConfig.guardianSetting
    );
    if (!targetHotReserveBucket) throw new Error("Wrong guardian setting");

    const twoWayPegConfiguration =
      await zplClient.twoWayPeg.accounts.getConfiguration();

    const ix =
      zplClient.twoWayPeg.instructions.buildReactivateHotReserveBucketIx(
        HOT_RESERVE_BUCKET_VALIDITY_PERIOD,
        solanaPubkey,
        targetHotReserveBucket.publicKey,
        twoWayPegConfiguration.layerFeeCollector
      );

    const sig = await zplClient.signAndSendTransactionWithInstructions([ix]);
    notifyTx(true, {
      chain: Chain.Solana,
      txId: sig,
      solanaNetwork: solanaNetwork,
    });
  }, [
    zplClient,
    solanaPubkey,
    bitcoinWallet,
    solanaNetwork,
    networkConfig.guardianSetting,
  ]);

  const checkHotReserveBucketStatus = useCallback(async () => {
    if (!zplClient || !solanaPubkey) return;

    const userBitcoinXOnlyPublicKey =
      getInternalXOnlyPubkeyFromUserWallet(bitcoinWallet);

    if (!userBitcoinXOnlyPublicKey) return;

    const hotReserveBuckets =
      await zplClient.twoWayPeg.accounts.getHotReserveBucketsByBitcoinXOnlyPubkey(
        userBitcoinXOnlyPublicKey
      );

    if (hotReserveBuckets.length === 0)
      return { status: CheckBucketResult.NotFound };

    // NOTE: Regtest and Testnet use the same ZPL with different guardian settings, so we need to set guardian setting in env, and our mechanism only create 1 hot reserve bucket for each bitcoin public key in mainnet.
    const targetHotReserveBucket = hotReserveBuckets.find(
      (bucket) =>
        bucket.reserveSetting.toBase58() === networkConfig.guardianSetting
    );
    if (!targetHotReserveBucket) throw new Error("Wrong guardian setting");

    const status = targetHotReserveBucket.status;
    const owner = targetHotReserveBucket.owner;
    const expiredAt = targetHotReserveBucket.expiredAt;

    if (owner?.toBase58() !== solanaPubkey?.toBase58()) {
      return { owner: owner.toBase58(), status: CheckBucketResult.WrongOwner };
    }

    if (status === Number(HotReserveBucketStatus.Deactivated)) {
      return {
        status: CheckBucketResult.Deactivated,
      };
    }

    if (Date.now() > expiredAt.toNumber() * 1000) {
      return { status: CheckBucketResult.Expired };
    }

    return { status: CheckBucketResult.Activated };
  }, [zplClient, solanaPubkey, bitcoinWallet, networkConfig.guardianSetting]);

  return {
    createHotReserveBucket,
    reactivateHotReserveBucket,
    checkHotReserveBucketStatus,
  };
};

export default useHotReserveBucketActions;
