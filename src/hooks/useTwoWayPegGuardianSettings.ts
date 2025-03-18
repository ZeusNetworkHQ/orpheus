import { AxiosError } from "axios";
import useSWR from "swr";

import {
  twoWayPegGuardianSettingsScheme,
  TwoWayPegGuardianSettings,
} from "@/types/api";
import { Fetcher } from "@/utils/axios";

import { useFetchers } from "./useFetchers";
import { useNetworkConfig } from "./useNetworkConfig";

function useTwoWayPegGuardianSettings() {
  const config = useNetworkConfig();
  const { hermesFetcher } = useFetchers();
  const { data, mutate, isLoading } = useSWR<
    TwoWayPegGuardianSettings,
    AxiosError
  >(
    ["/api/v1/raw/layer/two-way-peg/guardian-settings", hermesFetcher],
    ([url, fetcher]: [url: string, fetcher: Fetcher]) =>
      fetcher(url, twoWayPegGuardianSettingsScheme),
    {
      refreshInterval: 60000,
      dedupingInterval: 60000,
    }
  );

  // NOTE: Regtest and Testnet use the same ZPL with different guardian settings, so we need to set guardian setting in env
  const twoWayPegGuardianSettings = data?.items?.filter(
    (item) => item.address === config.guardianSetting
  );

  return {
    data: twoWayPegGuardianSettings ?? [],
    mutate,
    isLoading,
  };
}

export default useTwoWayPegGuardianSettings;
