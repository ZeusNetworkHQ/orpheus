import BigNumber from "bignumber.js";
import { useRef, useState } from "react";

import Button from "@/components/Button/Button";
import Icon from "@/components/Icons";
import { Position } from "@/types/zplClient";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";

import RedeemModal from "../Modals/Redeem";

const PortfolioDetails = ({
  btcPrice,
  positions,
  zbtcBalance,
  zbtcBalanceInVault,
}: {
  btcPrice: number;
  positions: Position[] | undefined;
  zbtcBalance: BigNumber;
  zbtcBalanceInVault: BigNumber;
}) => {
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  const defiRef = useRef<HTMLDivElement>(null);
  const redeemRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full flex-col space-y-16">
      <div
        ref={defiRef}
        className="border-sys-color-card-light bg-sys-color-background-light relative flex w-full scroll-mt-[100px] flex-col items-center justify-center rounded-[25px] p-8"
      >
        <div className="border-apollo-border-15 relative flex h-full w-full flex-col rounded-[17px] border bg-white px-16 py-12 shadow-[inset_0px_2px_2px_rgba(139,138,158,0.1)]">
          <span className="body-body1-semibold text-sys-color-text-primary">
            <b>Available</b>
          </span>
        </div>
        <div className="flex w-full flex-col justify-between gap-y-40 px-20 py-16 md:flex-row md:items-center md:gap-y-0">
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-8">
              <Icon name="zbtc" size={24 as 12 | 14 | 18} />
              <b className="text-2xl">
                <span className="headline-headline3 text-sys-color-text-primary">
                  {zbtcBalance.gt(0)
                    ? formatValue(zbtcBalance.div(10 ** BTC_DECIMALS), 6)
                    : 0}{" "}
                  <span className="headline-headline4">zBTC</span>
                </span>
              </b>
            </div>
            <span className="body-body1-medium text-sys-color-text-primary">
              ~$
              {zbtcBalance.gt(0)
                ? formatValue(
                    zbtcBalance.div(10 ** BTC_DECIMALS).multipliedBy(btcPrice),
                    2
                  )
                : 0}{" "}
              USD
            </span>
          </div>
        </div>
      </div>
      <div
        ref={redeemRef}
        className="border-sys-color-card-light bg-sys-color-background-light relative flex w-full scroll-mt-[250px] flex-col justify-center rounded-[25px] p-8"
      >
        <div className="border-apollo-border-15 relative flex h-full w-full flex-col rounded-[17px] border bg-white px-16 py-12 shadow-[inset_0px_2px_2px_rgba(139,138,158,0.1)]">
          <span className="body-body1-semibold text-sys-color-text-primary">
            <b>Custodial</b>
          </span>
        </div>
        <div className="flex flex-col justify-between gap-y-32 px-20 py-16 md:flex-row md:items-center md:gap-y-0">
          <div className="flex flex-col gap-y-8">
            <div className="flex items-center gap-x-8">
              <Icon name="zbtc" size={24 as 12 | 14 | 18} />
              <b className="text-2xl">
                <span className="headline-headline3 text-sys-color-text-primary">
                  {zbtcBalanceInVault.gt(0)
                    ? formatValue(zbtcBalanceInVault.div(10 ** BTC_DECIMALS), 6)
                    : 0}{" "}
                  <span className="headline-headline4">zBTC</span>
                </span>
              </b>
              <Icon name="Lock" size={18} />
            </div>
            <span className="body-body1-medium text-sys-color-text-primary">
              ~$
              {zbtcBalanceInVault.gt(0)
                ? formatValue(
                    zbtcBalanceInVault
                      .div(10 ** BTC_DECIMALS)
                      .multipliedBy(btcPrice),
                    2
                  )
                : 0}{" "}
              USD
            </span>
          </div>
          <Button
            type="secondary"
            icon={"Withdraw02"}
            size="small"
            label="Redeem"
            className="w-max"
            onClick={() => setIsRedeemModalOpen(true)}
          />
        </div>
      </div>

      <RedeemModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        btcPrice={btcPrice}
        positions={positions}
        balance={zbtcBalanceInVault.div(10 ** BTC_DECIMALS).toNumber()}
        max={zbtcBalanceInVault.div(10 ** BTC_DECIMALS).toNumber()}
      />
    </div>
  );
};

export default PortfolioDetails;
