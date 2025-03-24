import { useWallet } from "@solana/wallet-adapter-react";
import BigNumber from "bignumber.js";

import useBalance from "@/hooks/misc/useBalance";
import usePrice from "@/hooks/misc/usePrice";
import usePositions from "@/hooks/zpl/usePositions";

import PortfolioBalance from "./PortfolioBalance";
import PortfolioDetails from "./PortfolioDetails";

export default function PortfolioOverview() {
  const { publicKey: solanaPubkey } = useWallet();
  const { price: btcPrice } = usePrice("BTCUSDC");
  const { data: zbtcBalance } = useBalance(solanaPubkey);
  const { data: positions } = usePositions(solanaPubkey);

  const zbtcBalanceInVault =
    positions?.reduce(
      (acc, cur) =>
        acc
          .plus(cur.storedAmount.toString())
          .minus(cur.frozenAmount.toString()),
      new BigNumber(0)
    ) ?? new BigNumber(0);

  return (
    <div className="ds">
      <div className="flex h-auto flex-col gap-y-36 lg:h-full">
        <div className="flex h-full flex-col items-stretch gap-y-16 lg:flex-row lg:flex-wrap lg:gap-x-16 xl:flex-nowrap xl:gap-y-0">
          <PortfolioBalance
            btcPrice={btcPrice}
            zbtcBalance={zbtcBalance}
            zbtcBalanceInVault={zbtcBalanceInVault}
          />
          <PortfolioDetails
            btcPrice={btcPrice}
            positions={positions}
            zbtcBalance={zbtcBalance}
            zbtcBalanceInVault={zbtcBalanceInVault}
          />
        </div>
      </div>
    </div>
  );
}
