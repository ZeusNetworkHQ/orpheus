import classNames from "classnames";
import {
  scaleTime,
  scaleLinear,
  max,
  min,
  line as d3_line,
  area as d3area,
  curveMonotoneX,
} from "d3";
import { CSSProperties } from "react";

import { ChartDataPoint } from "@/types/chart";

import { ClientTooltip, TooltipContent, TooltipTrigger } from "./ChartTooltip";

export function AreaChart({
  data,
  theme = "primary",
  btcPrice,
  showHourlyTimestamps = false,
  showDecimals = true,
}: {
  data: ChartDataPoint[];
  theme?: "primary" | "secondary";
  btcPrice?: number;
  showHourlyTimestamps?: boolean;
  showDecimals?: boolean;
}) {
  const xScale = scaleTime()
    .domain([data[0].date, data[data.length - 1].date])
    .range([0, 100]);

  const maxValue = max(data.map((d) => d.value)) ?? 0;
  const minValue = min(data.map((d) => d.value)) ?? 0;

  const dataRange = maxValue - minValue;
  const yScale = scaleLinear()
    .domain([0, max(data.map((d) => d.value)) ?? 0])
    .range([100, 0]);

  const line = d3_line<(typeof data)[number]>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const d = line(data);

  if (!d) {
    return null;
  }

  const area = d3area<(typeof data)[number]>()
    .x((d) => xScale(d.date))
    .y0(yScale(0))
    .y1((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const areaPath = area(data) ?? undefined;

  const isSmallRange = dataRange / maxValue < 0.01;

  const getDecimalPlaces = (min: number, max: number): number => {
    const range = max - min;
    if (range === 0) return showDecimals ? 1 : 0;

    // For very small ranges relative to the values, show more decimal places
    if (isSmallRange) return 3;
    if (range < 0.1) return 3;
    if (range < 1) return 2;
    return showDecimals ? 1 : 0;
  };

  const getNiceMaxValue = (value: number, min: number): number => {
    if (isSmallRange) {
      // For small ranges, add a small percentage to ensure max is above all data points
      return value + (value - min) * 0.1;
    }

    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const ratio = value / magnitude;

    if (ratio < 1.1) return magnitude;
    if (ratio < 1.5) return 1.5 * magnitude;
    if (ratio < 2) return 2 * magnitude;
    if (ratio < 2.5) return 2.5 * magnitude;
    if (ratio < 3) return 3 * magnitude;
    if (ratio < 4) return 4 * magnitude;
    if (ratio < 5) return 5 * magnitude;
    return 10 * magnitude;
  };

  const getNiceMinValue = (min: number, max: number): number => {
    if (min === max) return min * 0.9; // If min equals max, return slightly lower value

    if (isSmallRange) {
      // For small ranges, subtract a small percentage to ensure min is below all data points
      return min - (max - min) * 0.1;
    }

    // For normal ranges, we can start from 0 if min is close to 0
    if (min / maxValue < 0.1) return 0;

    // Otherwise, round down to a nice value
    const magnitude = Math.pow(10, Math.floor(Math.log10(min)));
    return Math.floor(min / magnitude) * magnitude;
  };

  const niceMax = getNiceMaxValue(maxValue, minValue);
  const niceMin = getNiceMinValue(minValue, maxValue);

  const formatNumber = (value: number): string => {
    const decimalPlaces = getDecimalPlaces(niceMin, niceMax);

    // Format numbers without showing decimal places if they're all zeros
    const formatWithOptionalDecimals = (num: number): string => {
      // First format to the specified decimal places
      const formatted = num.toFixed(decimalPlaces);

      // Check if all digits after decimal point are zeros
      if (decimalPlaces > 0 && !/\.0+$/.test(formatted)) {
        // If not all zeros, keep the original format
        return formatted;
      }

      // If all zeros, remove decimal point and trailing zeros
      return Math.round(num).toString();
    };

    if (value >= 1_000_000_000) {
      return `${formatWithOptionalDecimals(value / 1_000_000_000)}B`;
    } else if (value >= 1_000_000) {
      return `${formatWithOptionalDecimals(value / 1_000_000)}M`;
    } else if (value >= 1_000) {
      return `${formatWithOptionalDecimals(value / 1_000)}K`;
    } else {
      return formatWithOptionalDecimals(value);
    }
  };

  return (
    <div
      className="relative h-72 w-full"
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "0px",
          "--marginBottom": "42px",
          "--marginLeft": "48px",
          "--marginRightMobile": "4px",
          "--marginBottomMobile": "40px",
          "--marginLeftMobile": "52px",
        } as CSSProperties
      }
    >
      {/* Y axis */}
      <div
        className="absolute left-2
          h-[calc(100%-var(--marginTop)-var(--marginBottomMobile))]
          w-[var(--marginLeftMobile)]
          translate-y-[var(--marginTop)]
          overflow-visible
          sm:h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          sm:w-[var(--marginLeft)]
        "
      >
        {yScale
          .ticks(6)
          .map(yScale.tickFormat(6, "d"))
          .map((value, i) => (
            <div
              key={i}
              style={{
                top: `${yScale(+value)}%`,
                left: "0%",
              }}
              className="caption-caption absolute w-full -translate-y-1/2 pr-8 text-right tabular-nums text-shade-mute"
            >
              {formatNumber(+value)}
            </div>
          ))}
      </div>

      {/* Chart area */}
      <div
        className="absolute inset-0
          h-[calc(100%-var(--marginTop)-var(--marginBottom))]
          
          w-[calc(100%-var(--marginLeft)-var(--marginRight))]
          translate-x-[var(--marginLeft)]
          translate-y-[var(--marginTop)]
          overflow-visible
        "
      >
        {/* Pulsating dot */}
        <div
          className="absolute size-2"
          style={{
            left: `${xScale(data[data.length - 1].date)}%`,
            top: `${yScale(data[data.length - 1].value)}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className={classNames(
              "h-full w-full animate-ping rounded-full border-2",
              theme === "primary"
                ? "border-primary-apollo bg-primary-apollo/20"
                : "border-primary-apolloSecondary bg-primary-apolloSecondary/20"
            )}
          />
        </div>
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {yScale
            .ticks(8)
            .map(yScale.tickFormat(8, "d"))
            .map((active, i) => (
              <g
                transform={`translate(0,${yScale(+active)})`}
                className="text-shade-mute/15"
                key={i}
              >
                <line
                  x1={0}
                  x2={100}
                  stroke="currentColor"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}

          <path
            d={areaPath}
            className="text-white"
            fill="url(#outlinedAreaGradient)"
          />
          <defs>
            {/* Gradient definition */}
            <linearGradient
              id="outlinedAreaGradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                className={classNames(
                  theme === "primary"
                    ? "text-primary-apollo/20"
                    : "text-primary-apolloSecondary/20"
                )}
                stopColor="currentColor"
              />
              <stop
                offset="100%"
                className={classNames(
                  theme === "primary"
                    ? "text-primary-apollo/0"
                    : "text-primary-apolloSecondary/0"
                )}
                stopColor="currentColor"
              />
            </linearGradient>
          </defs>
          {/* Line */}
          <path
            d={d}
            fill="none"
            className={classNames(
              theme === "primary"
                ? "text-primary-apollo"
                : "text-primary-apolloSecondary"
            )}
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Circles and Tooltips */}
          {data.map((d, index) => (
            <ClientTooltip key={index}>
              <TooltipTrigger>
                <g className="group/tooltip">
                  {/* Circle indicator */}

                  <path
                    d={`M ${xScale(d.date)} ${yScale(d.value)} l 0.0001 0`}
                    className={classNames(
                      "opacity-0 transition-opacity group-hover/tooltip:opacity-100",
                      theme === "primary"
                        ? "text-primary-apollo"
                        : "text-primary-apolloSecondary"
                    )}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                  />

                  {/* Invisible area closest to a specific point for the tooltip trigger */}
                  <rect
                    x={(() => {
                      const prevX =
                        index > 0
                          ? xScale(data[index - 1].date)
                          : xScale(d.date);
                      return (prevX + xScale(d.date)) / 2;
                    })()}
                    y={0}
                    width={(() => {
                      const prevX =
                        index > 0
                          ? xScale(data[index - 1].date)
                          : xScale(d.date);
                      const nextX =
                        index < data.length - 1
                          ? xScale(data[index + 1].date)
                          : xScale(d.date);
                      const leftBound = (prevX + xScale(d.date)) / 2;
                      const rightBound = (xScale(d.date) + nextX) / 2;
                      return rightBound - leftBound;
                    })()}
                    height={100}
                    fill="transparent"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent theme={theme}>
                <div className="text-shade-mute">
                  {`${d.date.getFullYear()}/${String(d.date.getMonth() + 1).padStart(2, "0")}/${String(d.date.getDate()).padStart(2, "0")}`}
                  {showHourlyTimestamps &&
                    ` ${d.date.getHours()}:${String(d.date.getMinutes()).padStart(2, "0")}`}
                </div>
                <div className="flex flex-col gap-y-4">
                  {btcPrice ? (
                    <>
                      <div className="flex items-center justify-between gap-x-64">
                        <span className="text-shade-secondary">USD</span>
                        <span className="text-shade-primary">
                          {formatNumber(d.value)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-x-64">
                        <span className="text-shade-secondary">BTC</span>
                        <span className="text-shade-primary">
                          {formatNumber(d.value / btcPrice)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-shade-primary">
                      {d.value.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </ClientTooltip>
          ))}
        </svg>

        <div className="flex w-full translate-y-12 items-center justify-between text-sm md:text-lg">
          {/* X Axis */}
          {data.map((day, i) => {
            const numDatesToShow = 7;
            const interval = Math.max(
              1,
              Math.floor((data.length - 1) / (numDatesToShow - 1))
            );

            const indicesToShow = [0];
            for (let j = 1; j < numDatesToShow - 1; j++) {
              indicesToShow.push(
                Math.min(data.length - 1, Math.round(j * interval))
              );
            }
            indicesToShow.push(data.length - 1);

            const shouldShow = indicesToShow.includes(i);

            if (!shouldShow) return null;

            const currentMonth = day.date.getMonth();
            const isFirstMonthOccurrence = indicesToShow
              .filter((idx) => idx < i)
              .every((idx) => data[idx].date.getMonth() !== currentMonth);

            // For hourly timestamps, check if this is the first occurrence of this day
            const currentDay = day.date.getDate();
            const isFirstDayOccurrence = indicesToShow
              .filter((idx) => idx < i)
              .every(
                (idx) =>
                  data[idx].date.getDate() !== currentDay ||
                  data[idx].date.getMonth() !== currentMonth
              );

            return (
              <div
                key={i}
                className={classNames(
                  "overflow-visible text-nowrap text-shade-mute",
                  showHourlyTimestamps && "even:hidden sm:even:block"
                )}
              >
                <div
                  style={{
                    top: "100%",
                  }}
                  className="caption-caption"
                >
                  {showHourlyTimestamps
                    ? isFirstDayOccurrence
                      ? `${
                          isFirstMonthOccurrence
                            ? day.date.toLocaleDateString("en-US", {
                                month: "short",
                              }) + " "
                            : ""
                        }${day.date.getDate()}, ${day.date.getHours()}:00`
                      : `${day.date.getHours()}:00`
                    : `${
                        isFirstMonthOccurrence
                          ? day.date.toLocaleDateString("en-US", {
                              month: "short",
                            }) + " "
                          : ""
                      }${day.date.getDate()}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
