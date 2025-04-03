import { AxiosError } from "axios";
import useSWR from "swr";

import { useFetchers } from "@/hooks/misc/useFetchers";
import { accumulatedStatsSchema, assetVarianceSchema } from "@/types/api";
import { Fetcher } from "@/utils/axios";
import { BTC_DECIMALS } from "@/utils/constant";

export interface DashboardStats {
  totalVolume: number;
  volume24HrVariance: number;
  totalUniqueWallets: number;
}

function useDashboardStats(guardianSettings: string[]) {
  const { hermesFetcher } = useFetchers();
  const { data, mutate, error, isLoading } = useSWR<DashboardStats, AxiosError>(
    guardianSettings.length > 0
      ? [
          "api/v1/aggregated/asset/volume/accumulated",
          "api/v1/aggregated/asset/volume/snapshot/24hr-variance",
          "api/v1/aggregated/hot-reserve-buckets/amount/accumulated",
          guardianSettings,
          hermesFetcher,
        ]
      : null,
    async ([volumeUrl, volumeVarianceUrl, walletUrl, settings, fetcher]: [
      volumeUrl: string,
      volumeVarianceUrl: string,
      walletUrl: string,
      settings: string[],
      fetcher: Fetcher,
    ]) => {
      const guardianSettingsQuery = settings
        .map((setting) => `guardian_settings=${setting}`)
        .join("&");

      const totalVolume = await fetcher(
        `${volumeUrl}?${guardianSettingsQuery}`,
        accumulatedStatsSchema
      );
      const volumeVarianceData = await fetcher(
        `${volumeVarianceUrl}?${guardianSettingsQuery}`,
        assetVarianceSchema
      );
      const totalUniqueWallets = await fetcher(
        walletUrl,
        accumulatedStatsSchema
      );

      return {
        totalVolume: totalVolume / 10 ** BTC_DECIMALS,
        volume24HrVariance:
          volumeVarianceData.current_minus_24hr / 10 ** BTC_DECIMALS,
        totalUniqueWallets,
      };
    },
    {
      dedupingInterval: 60000,
      refreshInterval: 60000,
    }
  );

  return {
    data,
    mutate,
    isLoading,
    error,
  };
}

export default useDashboardStats;
