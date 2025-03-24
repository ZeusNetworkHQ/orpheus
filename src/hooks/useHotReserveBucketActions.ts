import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback } from "react";

import { useZplClient } from "@/contexts/ZplClientProvider";
import usePersistentStore from "@/stores/persistentStore";
import { CheckBucketResult } from "@/types/misc";
import { Chain } from "@/types/network";
import { BitcoinWallet } from "@/types/wallet";
import { HotReserveBucketStatus } from "@/types/zplClient";
import {
  convertBitcoinNetwork,
  getInternalXOnlyPubkeyFromUserWallet,
  UNLOCK_BLOCK_HEIGHT,
} from "@/utils/bitcoin";
import { hotReserveAddressCalculate } from "@/utils/hotReserveBucket";
import { notifyTx } from "@/utils/notification";

import useColdReserveBuckets from "./useColdReserveBuckets";
import { useNetworkConfig } from "./useNetworkConfig";
import useTwoWayPegGuardianSettings from "./useTwoWayPegGuardianSettings";

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
      (bucket) => bucket.guardian_setting === selectedGuardian.address
    );

    if (!coldReserveBucket)
      throw new Error("Cold Reserve Bucket not found for the guardian setting");

    const guardianXOnlyPublicKey = Buffer.from(
      coldReserveBucket.key_path_spend_public_key,
      "hex"
    );

    const userBitcoinXOnlyPublicKey =
      getInternalXOnlyPubkeyFromUserWallet(bitcoinWallet);

    if (!userBitcoinXOnlyPublicKey)
      throw new Error("Can't get x-only publickey");

    const { pubkey: hotReserveBitcoinXOnlyPublicKey } =
      hotReserveAddressCalculate(
        guardianXOnlyPublicKey,
        userBitcoinXOnlyPublicKey,
        UNLOCK_BLOCK_HEIGHT,
        convertBitcoinNetwork(bitcoinNetwork)
      );

    if (!hotReserveBitcoinXOnlyPublicKey)
      throw new Error("Can't get hot reserve x-only publickey");

    const twoWayPegConfiguration = await zplClient.getTwoWayPegConfiguration();

    const ix = zplClient.constructCreateHotReserveBucketIx(
      solanaPubkey,
      hotReserveBitcoinXOnlyPublicKey,
      userBitcoinXOnlyPublicKey,
      UNLOCK_BLOCK_HEIGHT,
      new PublicKey(selectedGuardian.address),
      new PublicKey(selectedGuardian.guardian_certificate),
      new PublicKey(coldReserveBucket.address),
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
    bitcoinNetwork,
    solanaNetwork,
    coldReserveBuckets,
    twoWayPegGuardianSettings,
  ]);

  const reactivateHotReserveBucket = useCallback(async () => {
    if (!zplClient) return;

    const userBitcoinXOnlyPublicKey =
      getInternalXOnlyPubkeyFromUserWallet(bitcoinWallet);

    if (!userBitcoinXOnlyPublicKey) return;

    const hotReserveBuckets =
      await zplClient.getHotReserveBucketsByBitcoinXOnlyPubkey(
        userBitcoinXOnlyPublicKey
      );

    if (hotReserveBuckets.length === 0) return;

    const targetHotReserveBucket = hotReserveBuckets.find(
      (bucket) =>
        bucket.guardianSetting.toBase58() === networkConfig.guardianSetting
    );
    if (!targetHotReserveBucket) throw new Error("Wrong guardian setting");

    const twoWayPegConfiguration = await zplClient.getTwoWayPegConfiguration();

    const ix = zplClient.constructReactivateHotReserveBucketIx(
      targetHotReserveBucket.publicKey,
      twoWayPegConfiguration.layerFeeCollector
    );

    const sig = await zplClient.signAndSendTransactionWithInstructions([ix]);
    notifyTx(true, {
      chain: Chain.Solana,
      txId: sig,
      solanaNetwork: solanaNetwork,
    });
  }, [zplClient, bitcoinWallet, solanaNetwork, networkConfig.guardianSetting]);

  const checkHotReserveBucketStatus = useCallback(async () => {
    if (!zplClient || !solanaPubkey) return;

    const userBitcoinXOnlyPublicKey =
      getInternalXOnlyPubkeyFromUserWallet(bitcoinWallet);

    if (!userBitcoinXOnlyPublicKey) return;

    const hotReserveBuckets =
      await zplClient.getHotReserveBucketsByBitcoinXOnlyPubkey(
        userBitcoinXOnlyPublicKey
      );

    if (hotReserveBuckets.length === 0)
      return { status: CheckBucketResult.NotFound };

    // NOTE: Regtest and Testnet use the same ZPL with different guardian settings, so we need to set guardian setting in env, and our mechanism only create 1 hot reserve bucket for each bitcoin public key in mainnet.
    const targetHotReserveBucket = hotReserveBuckets.find(
      (bucket) =>
        bucket.guardianSetting.toBase58() === networkConfig.guardianSetting
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
