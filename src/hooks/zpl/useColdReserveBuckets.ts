import useSWR from "swr";

import { useZplClient } from "@/contexts/ZplClientProvider";

function useColdReserveBuckets() {
  const client = useZplClient();
  const { data, mutate, isLoading } = useSWR(
    client ? [client, "getColdReserveBuckets"] : null,
    ([client]) => client.getColdReserveBuckets(),
    {
      dedupingInterval: 3600000,
    }
  );

  return {
    data: data ?? [],
    mutate,
    isLoading,
  };
}

export default useColdReserveBuckets;
