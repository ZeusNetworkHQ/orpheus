import { AxiosError } from "axios";
import useSWR from "swr";

import { useFetchers } from "@/hooks/misc/useFetchers";
import { PriceInfo, priceInfoSchema } from "@/types/api";

const usePrice = (symbol: string) => {
  const { binanceFetcher } = useFetchers();
  const { data, mutate } = useSWR<PriceInfo, AxiosError>(
    `/v3/ticker/price?symbol=${symbol}`,
    (url: string) => binanceFetcher(url, priceInfoSchema),
    {
      dedupingInterval: 60000,
      refreshInterval: 60000,
    }
  );
  const price = parseFloat(data?.price ?? "0");

  return { price, mutate };
};

export default usePrice;
