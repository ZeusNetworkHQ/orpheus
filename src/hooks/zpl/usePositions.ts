import { PublicKey } from "@solana/web3.js";
import useSWR from "swr";

import { useZplClient } from "@/contexts/ZplClientProvider";
import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";

function usePositions(solanaPubkey: PublicKey | null) {
  const client = useZplClient();
  const config = useNetworkConfig();
  const { data, mutate, isLoading } = useSWR(
    client && solanaPubkey
      ? [client, solanaPubkey, "getPositionsByWallet"]
      : null,
    async ([client, solanaPubkey]) => {
      const positions =
        await client?.liquidityManagement.accounts.getPositionsByWallet(
          solanaPubkey
        );

      const targetPositions = positions.filter(
        (position) =>
          position.vaultSetting.toBase58() ===
          client.liquidityManagement.pdas
            .deriveVaultSettingAddress(new PublicKey(config.guardianSetting))
            .toBase58()
      );

      return targetPositions;
    },
    {
      keepPreviousData: true,
      refreshInterval: 60000,
      dedupingInterval: 60000,
    }
  );

  return {
    data: data ?? [],
    mutate,
    isLoading,
  };
}

export default usePositions;
