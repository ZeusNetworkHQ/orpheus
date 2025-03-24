import { PublicKey } from "@solana/web3.js";
import useSWR from "swr";

import { useZplClient } from "@/contexts/ZplClientProvider";

function useHotReserveBucketsByOwner(solanaPubkey: PublicKey | null) {
  const client = useZplClient();
  const { data, mutate, isLoading } = useSWR(
    client && solanaPubkey
      ? [client, solanaPubkey, "getHotReserveBucketsByOwner"]
      : null,
    ([client, solanaPubkey]) =>
      client.getHotReserveBucketsBySolanaPubkey(solanaPubkey),
    {
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

export default useHotReserveBucketsByOwner;
