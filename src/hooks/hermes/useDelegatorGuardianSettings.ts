import { AxiosError } from "axios";
import useSWR from "swr";

import { useFetchers } from "@/hooks/misc/useFetchers";
import {
  delegatorGuardianSettingsScheme,
  DelegatorGuardianSettings,
} from "@/types/api";
import { Fetcher } from "@/utils/axios";

function useDelegatorGuardianSettings() {
  const { hermesFetcher } = useFetchers();
  const { data, mutate, isLoading } = useSWR<
    DelegatorGuardianSettings,
    AxiosError
  >(
    ["/api/v1/raw/layer/delegator/guardian-settings", hermesFetcher],
    ([url, fetcher]: [url: string, fetcher: Fetcher]) =>
      fetcher(url, delegatorGuardianSettingsScheme),
    {
      refreshInterval: 60000,
      dedupingInterval: 60000,
    }
  );

  return {
    data: data?.items ?? [],
    mutate,
    isLoading,
  };
}

export default useDelegatorGuardianSettings;
