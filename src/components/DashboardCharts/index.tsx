import { motion } from "framer-motion";

import Icon from "@/components/Icons";
import Skeleton from "@/components/Skeleton/Skeleton";
import { ChartDataPoint } from "@/types/chart";
import { SECONDS_PER_DAY } from "@/utils/constant";
import { formatValue } from "@/utils/format";

import { AreaChart } from "./AreaChart";

type DashboardChartsProps = {
  isLoading: boolean;
  btcPrice: number;
  selectedTimeline: number;
  tvl: number;
  totalVolume: number;
  uniqueWallets: number;
  recentDayHourlyHotReserveBucketsChartData: ChartDataPoint[];
  recentWeekDailyHotReserveBucketsChartData: ChartDataPoint[];
  recentMonthDailyHotReserveBucketsChartData: ChartDataPoint[];
  allWeeklyHotReserveBucketsChartData: ChartDataPoint[];
  recentDayHourlyVolumeChartData: ChartDataPoint[];
  recentWeekDailyVolumeChartData: ChartDataPoint[];
  recentMonthDailyVolumeChartData: ChartDataPoint[];
  allWeeklyVolumeChartData: ChartDataPoint[];
  recentDayHourlyAmountChartData: ChartDataPoint[];
  recentWeekDailyAmountChartData: ChartDataPoint[];
  recentMonthDailyAmountChartData: ChartDataPoint[];
  allWeeklyAmountChartData: ChartDataPoint[];
  showHourlyTimestamps: boolean;
};

export default function DashboardCharts({
  isLoading,
  btcPrice,
  selectedTimeline,
  tvl,
  totalVolume,
  uniqueWallets,
  recentDayHourlyHotReserveBucketsChartData,
  recentWeekDailyHotReserveBucketsChartData,
  recentMonthDailyHotReserveBucketsChartData,
  allWeeklyHotReserveBucketsChartData,
  recentDayHourlyVolumeChartData,
  recentWeekDailyVolumeChartData,
  recentMonthDailyVolumeChartData,
  allWeeklyVolumeChartData,
  recentDayHourlyAmountChartData,
  recentWeekDailyAmountChartData,
  recentMonthDailyAmountChartData,
  allWeeklyAmountChartData,
  showHourlyTimestamps,
}: DashboardChartsProps) {
  const tvlChartDataMap: Record<number, ChartDataPoint[]> = {
    0: recentDayHourlyAmountChartData,
    1: recentWeekDailyAmountChartData,
    2: recentMonthDailyAmountChartData,
    3: allWeeklyAmountChartData.filter(
      (point) =>
        point.date >= new Date(Date.now() - SECONDS_PER_DAY * 365 * 1000)
    ),
    4: allWeeklyAmountChartData,
  };

  const volumeChartDataMap: Record<number, ChartDataPoint[]> = {
    0: recentDayHourlyVolumeChartData,
    1: recentWeekDailyVolumeChartData,
    2: recentMonthDailyVolumeChartData,
    3: allWeeklyVolumeChartData.filter(
      (point) =>
        point.date >= new Date(Date.now() - SECONDS_PER_DAY * 365 * 1000)
    ),
    4: allWeeklyVolumeChartData,
  };

  const hotReserveBucketsChartDataMap: Record<number, ChartDataPoint[]> = {
    0: recentDayHourlyHotReserveBucketsChartData,
    1: recentWeekDailyHotReserveBucketsChartData,
    2: recentMonthDailyHotReserveBucketsChartData,
    3: allWeeklyHotReserveBucketsChartData.filter(
      (point) =>
        point.date >= new Date(Date.now() - SECONDS_PER_DAY * 365 * 1000)
    ),
    4: allWeeklyHotReserveBucketsChartData,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-y-20"
    >
      <div className="bg-sys-color-background-card flex flex-col gap-y-32 rounded-[25px] border border-[#2C2C36] px-12 py-24 pb-24 sm:px-20 sm:pb-32">
        <div className="flex flex-col gap-y-8 px-8">
          <span className="text-apollo-brand-secondary-orange headline-headline6">
            Total Value Locked
          </span>
          {isLoading ? (
            <Skeleton
              height="40px"
              classes="bg-sys-color-background-card-foreground rounded-8 !w-2/3 lg:!w-1/3"
            />
          ) : (
            <div className="flex flex-wrap items-end gap-x-12">
              <span className="headline-headline3 sm:headline-headline2 text-white">
                ${formatValue(tvl, 0)}
              </span>
              <div className="gap-x-apollo-6 mb-4 flex items-center">
                <Icon name="btc" size={18} />
                <span className="headline-headline6 text-sys-color-text-secondary">
                  {formatValue(tvl / btcPrice, 2)} BTC
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="h-[275px] w-full">
          <AreaChart
            data={tvlChartDataMap[selectedTimeline]}
            theme="primary"
            btcPrice={btcPrice}
            showHourlyTimestamps={showHourlyTimestamps}
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-20 lg:flex-row">
        <div className="w-full rounded-[25px] border border-[#2C2C36] px-8 pt-8">
          <div className="border-apollo-border-15 bg-sys-color-background-card py-apollo-10 w-full rounded-[15px] border px-12 shadow-[inset_0px_2px_2px_rgba(139,138,158,0.1)] sm:px-20">
            <span className="body-body1-semibold md:headline-headline6 text-sys-color-text-secondary">
              Total Volume
            </span>
          </div>

          <div className="flex flex-col gap-y-32 px-4 pb-20 pt-24 sm:px-12">
            {isLoading ? (
              <Skeleton
                height="40px"
                classes="bg-sys-color-background-card-foreground rounded-8 !w-2/3 lg:!w-1/3"
              />
            ) : (
              <div className="flex flex-wrap items-end gap-x-12 px-8">
                <span className="headline-headline3 sm:headline-headline2 text-white">
                  ${formatValue(totalVolume, 0)}
                </span>
                <div className="gap-x-apollo-6 mb-4 flex items-center">
                  <Icon name="btc" size={18} />
                  <span className="headline-headline6 text-sys-color-text-secondary">
                    {formatValue(totalVolume / btcPrice, 2)} BTC
                  </span>
                </div>
              </div>
            )}
            <div className="h-[275px] w-full">
              <AreaChart
                data={volumeChartDataMap[selectedTimeline]}
                theme="secondary"
                btcPrice={btcPrice}
                showHourlyTimestamps={showHourlyTimestamps}
              />
            </div>
          </div>
        </div>

        <div className="w-full rounded-[25px] border border-[#2C2C36] px-8 pt-8">
          <div className="border-apollo-border-15 bg-sys-color-background-card py-apollo-10 w-full rounded-[15px] border px-12 shadow-[inset_0px_2px_2px_rgba(139,138,158,0.1)] sm:px-20">
            <span className="body-body1-semibold sm:headline-headline6 text-sys-color-text-secondary">
              Unique Wallets
            </span>
          </div>

          <div className="flex flex-col gap-y-32 px-4 pb-20 pt-24 sm:px-12">
            {isLoading ? (
              <Skeleton
                height="40px"
                classes="bg-sys-color-background-card-foreground rounded-8 !w-2/3 lg:!w-1/3"
              />
            ) : (
              <div className="flex items-end gap-x-12 px-8">
                <span className="headline-headline3 sm:headline-headline2 text-white">
                  {uniqueWallets}
                </span>
              </div>
            )}
            <div className="h-[275px] w-full">
              <AreaChart
                data={hotReserveBucketsChartDataMap[selectedTimeline]}
                theme="secondary"
                showHourlyTimestamps={showHourlyTimestamps}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
