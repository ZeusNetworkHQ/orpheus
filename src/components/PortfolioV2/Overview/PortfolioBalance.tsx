import BigNumber from "bignumber.js";

import Icon from "@/components/Icons";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";

import PortfolioPieChart from "./PortfolioPieChart";

const PortfolioBalance = ({
  btcPrice,
  zbtcBalance,
  zbtcBalanceInVault,
}: {
  btcPrice: number;
  zbtcBalance: BigNumber;
  zbtcBalanceInVault: BigNumber;
}) => {
  const totalBalance = zbtcBalance.plus(zbtcBalanceInVault ?? new BigNumber(0));

  return (
    <div className="border-sys-color-card-light flex w-full items-center justify-center rounded-[25px] border p-8 sm:flex-shrink-0 xl:w-[475px]">
      <div className="border-apollo-border-15 bg-sys-color-background-card relative flex h-full w-full flex-col gap-y-48 overflow-hidden rounded-[15px] border px-32 py-28">
        <div className="absolute inset-0 h-full w-full overflow-hidden"></div>
        <div className="z-10 flex flex-col space-y-48">
          <div className="space-y-apollo-6 z-10 flex flex-col">
            <span className="headline-headline5 text-sys-color-text-secondary">
              Total Balance
            </span>
            <div className="flex flex-col gap-y-4 md:flex-row md:items-start md:gap-x-12 md:gap-y-0">
              <div className="flex items-center gap-x-8">
                <Icon name="Zbtc" size={24 as 12 | 14 | 18} />
                <div className="headline-headline2 text-sys-color-text-primary">
                  {totalBalance.gt(0)
                    ? formatValue(totalBalance.div(10 ** BTC_DECIMALS), 6)
                    : 0}{" "}
                  {""}
                  <span className="headline-headline4">zBTC</span>
                </div>
              </div>
              <span className="body-body1-medium text-sys-color-text-secondary mt-0 md:mt-12">
                ~$
                {totalBalance.gt(0)
                  ? formatValue(
                      totalBalance
                        .div(10 ** BTC_DECIMALS)
                        .multipliedBy(btcPrice),
                      2
                    )
                  : 0}{" "}
                USD
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-y-24 md:flex-row md:items-end md:gap-x-32 md:gap-y-0">
            {/* Graph */}
            <PortfolioPieChart
              percentFilled={
                totalBalance.gt(0)
                  ? zbtcBalance.div(totalBalance).multipliedBy(100).toNumber()
                  : 0
              }
            />

            {/* Key */}
            <div className="flex w-full flex-col space-y-4">
              <div className="flex w-[175px] items-center justify-between gap-x-32 md:w-full lg:gap-x-0">
                <div className="gap-x-apollo-10 flex items-center md:w-full">
                  <div className="bg-apollo-brand-primary-orange h-12 w-12 flex-shrink-0 rounded-full"></div>
                  <span className="body-body1-medium text-sys-color-text-primary">
                    Available
                  </span>
                </div>
                <span className="body-body1-medium text-sys-color-text-primary flex-shrink-0">
                  {" "}
                  {totalBalance.gt(0)
                    ? formatValue(
                        zbtcBalance.div(totalBalance).multipliedBy(100),
                        0
                      )
                    : "0"}
                  %
                </span>
              </div>
              <div className="flex w-[175px] items-center justify-between gap-x-32 md:w-full md:justify-end lg:gap-x-0">
                <div className="gap-x-apollo-10 flex items-center md:w-full">
                  <div className="bg-sys-color-background-card h-12 w-12 flex-shrink-0 rounded-full shadow-[inset_0px_0px_5px_#FF6746] backdrop-blur-xl"></div>
                  <span className="body-body1-medium text-sys-color-text-secondary">
                    Custodial
                  </span>
                </div>
                <span className="body-body1-medium text-sys-color-text-primary flex-shrink-0">
                  {totalBalance.gt(0)
                    ? formatValue(
                        zbtcBalanceInVault.div(totalBalance).multipliedBy(100)
                      )
                    : "0"}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBalance;
