import { AxiosError } from "axios";
import useSWR from "swr";

import { UTXOs, utxosSchema } from "@/types/api";

import { useFetchers } from "./useFetchers";

const useBitcoinUTXOs = (bitcoinAddress: string | undefined) => {
  const { aresFetcher } = useFetchers();
  const { data, mutate, isLoading } = useSWR<UTXOs, AxiosError>(
    bitcoinAddress ? `api/v1/address/${bitcoinAddress}/utxos` : null,
    (url: string) => aresFetcher(url, utxosSchema),
    {
      refreshInterval: 10000,
      dedupingInterval: 10000,
    }
  );

  return {
    data: data ?? [],
    mutate,
    isLoading,
  };
};

export default useBitcoinUTXOs;
