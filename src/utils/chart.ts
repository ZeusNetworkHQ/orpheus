import dayjs from "dayjs";

import { DashboardChart } from "@/types/api";

import { BTC_DECIMALS } from "./constant";

export const fillChartData = (
  rawData: DashboardChart,
  range: number,
  unit: "hour" | "day",
  btcPrice?: number
) => {
  const format = unit === "hour" ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";

  const endTime = dayjs().endOf(unit);
  const startTime = dayjs()
    .subtract(range - 1, unit)
    .startOf(unit);

  const filledData = [];
  let current = startTime;
  while (current.isBefore(endTime) || current.isSame(endTime)) {
    const matchingRecord = rawData.find(
      (d) => dayjs(d.time * 1000).format(format) === current.format(format)
    );
    filledData.push({
      date: new Date(current.format(format)),
      value: matchingRecord
        ? btcPrice
          ? (matchingRecord.value / 10 ** BTC_DECIMALS) * btcPrice
          : matchingRecord.value
        : 0,
    });
    current = current.add(1, unit);
  }
  return filledData;
};
