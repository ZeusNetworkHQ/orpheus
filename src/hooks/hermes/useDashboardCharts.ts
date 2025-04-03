import { AxiosError } from "axios";
import useSWR from "swr";

import { useFetchers } from "@/hooks/misc/useFetchers";
import { DashboardChart, dashboardChartSchema } from "@/types/api";
import { Fetcher } from "@/utils/axios";

interface ChartsData {
  recentDayHourlyVolumeChartData: DashboardChart;
  recentWeekDailyVolumeChartData: DashboardChart;
  recentMonthDailyVolumeChartData: DashboardChart;
  allWeeklyVolumeChartData: DashboardChart;
  recentDayHourlyAmountChartData: DashboardChart;
  recentWeekDailyAmountChartData: DashboardChart;
  recentMonthDailyAmountChartData: DashboardChart;
  allWeeklyAmountChartData: DashboardChart;
  recentDayHourlyHotReserveBucketsChartData: DashboardChart;
  recentWeekDailyHotReserveBucketsChartData: DashboardChart;
  recentMonthDailyHotReserveBucketsChartData: DashboardChart;
  allWeeklyHotReserveBucketsChartData: DashboardChart;
}

function useDashboardCharts(guardianSettings: string[]) {
  const { hermesFetcher } = useFetchers();

  const { data, mutate, error, isLoading } = useSWR<ChartsData, AxiosError>(
    guardianSettings.length > 0
      ? [
          "api/v1/aggregated/asset/volume/snapshot/charts/d",
          "api/v1/aggregated/asset/volume/snapshot/charts/w",
          "api/v1/aggregated/asset/volume/snapshot/charts/m",
          "api/v1/aggregated/asset/volume/snapshot/charts/all",
          "api/v1/aggregated/asset/amount/snapshot/charts/d",
          "api/v1/aggregated/asset/amount/snapshot/charts/w",
          "api/v1/aggregated/asset/amount/snapshot/charts/m",
          "api/v1/aggregated/asset/amount/snapshot/charts/all",
          "api/v1/aggregated/hot-reserve-buckets/amount/snapshot/chart/d",
          "api/v1/aggregated/hot-reserve-buckets/amount/snapshot/chart/w",
          "api/v1/aggregated/hot-reserve-buckets/amount/snapshot/chart/m",
          "api/v1/aggregated/hot-reserve-buckets/amount/snapshot/chart/all",
          guardianSettings,
          hermesFetcher,
        ]
      : null,
    async ([
      volumeDayChartUrl,
      volumeWeekChartUrl,
      volumeMonthChartUrl,
      volumeAllChartUrl,
      amountDayChartUrl,
      amountWeekChartUrl,
      amountMonthChartUrl,
      amountAllChartUrl,
      hotReserveBucketsDayChartUrl,
      hotReserveBucketsWeekChartUrl,
      hotReserveBucketsMonthChartUrl,
      hotReserveBucketsAllChartUrl,
      settings,
      fetcher,
    ]: [
      volumeDayChartUrl: string,
      volumeWeekChartUrl: string,
      volumeMonthChartUrl: string,
      volumeAllChartUrl: string,
      amountDayChartUrl: string,
      amountWeekChartUrl: string,
      amountMonthChartUrl: string,
      amountAllChartUrl: string,
      hotReserveBucketsDayChartUrl: string,
      hotReserveBucketsWeekChartUrl: string,
      hotReserveBucketsMonthChartUrl: string,
      hotReserveBucketsAllChartUrl: string,
      settings: string[],
      fetcher: Fetcher,
    ]) => {
      const guardianSettingsQuery = settings
        .map((setting) => `guardian_settings=${setting}`)
        .join("&");

      const recentDayHourlyVolumeChartData = await fetcher(
        `${volumeDayChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );
      const recentWeekDailyVolumeChartData = await fetcher(
        `${volumeWeekChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );
      const recentMonthDailyVolumeChartData = await fetcher(
        `${volumeMonthChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );
      const allWeeklyVolumeChartData = await fetcher(
        `${volumeAllChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );

      const recentDayHourlyAmountChartData = await fetcher(
        `${amountDayChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );
      const recentWeekDailyAmountChartData = await fetcher(
        `${amountWeekChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );
      const recentMonthDailyAmountChartData = await fetcher(
        `${amountMonthChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );
      const allWeeklyAmountChartData = await fetcher(
        `${amountAllChartUrl}?${guardianSettingsQuery}`,
        dashboardChartSchema
      );

      const recentDayHourlyHotReserveBucketsChartData = await fetcher(
        hotReserveBucketsDayChartUrl,
        dashboardChartSchema
      );

      const recentWeekDailyHotReserveBucketsChartData = await fetcher(
        hotReserveBucketsWeekChartUrl,
        dashboardChartSchema
      );
      const recentMonthDailyHotReserveBucketsChartData = await fetcher(
        hotReserveBucketsMonthChartUrl,
        dashboardChartSchema
      );
      const allWeeklyHotReserveBucketsChartData = await fetcher(
        hotReserveBucketsAllChartUrl,
        dashboardChartSchema
      );

      return {
        recentDayHourlyVolumeChartData,
        recentWeekDailyVolumeChartData,
        recentMonthDailyVolumeChartData,
        allWeeklyVolumeChartData,
        recentDayHourlyAmountChartData,
        recentWeekDailyAmountChartData,
        recentMonthDailyAmountChartData,
        allWeeklyAmountChartData,
        recentDayHourlyHotReserveBucketsChartData,
        recentWeekDailyHotReserveBucketsChartData,
        recentMonthDailyHotReserveBucketsChartData,
        allWeeklyHotReserveBucketsChartData,
      };
    },
    {
      refreshInterval: 60000,
      dedupingInterval: 60000,
    }
  );

  return {
    data,
    mutate,
    isLoading,
    error,
  };
}

export default useDashboardCharts;
