import { AxiosError } from "axios";
import useSWR from "swr";

import { coldReserveBucketsSchema, ColdReserveBuckets } from "@/types/api";
import { Fetcher } from "@/utils/axios";

import { useFetchers } from "./useFetchers";

function useColdReserveBuckets() {
  const { hermesFetcher } = useFetchers();
  const { data, isLoading } = useSWR<ColdReserveBuckets, AxiosError>(
    ["/api/v1/raw/layer/cold-reserve-buckets", hermesFetcher],
    ([url, fetcher]: [url: string, fetcher: Fetcher]) =>
      fetcher(url, coldReserveBucketsSchema),
    {
      refreshInterval: 120000,
      dedupingInterval: 120000,
    }
  );

  return {
    data: data?.items ?? [],
    isLoading,
  };
}

export default useColdReserveBuckets;
