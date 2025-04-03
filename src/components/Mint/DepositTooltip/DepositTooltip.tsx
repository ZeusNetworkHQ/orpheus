import Tooltip from "@/components/Tooltip";
import { BTC_DECIMALS } from "@/utils/constant";
import { formatValue } from "@/utils/format";

export const DepositTooltip = ({
  totalBalance,
  availableUtxoAmount,
  unavailableUtxoAmount,
  isOpen,
}: {
  isOpen: boolean;
  totalBalance: number;
  availableUtxoAmount: number;
  unavailableUtxoAmount: number;
}) => {
  return (
    <Tooltip
      isOpen={isOpen}
      arrowPosition="bottom-right"
      theme="dark-alt"
      width={300}
    >
      <div className="body-body2-semibold flex flex-col gap-y-8">
        <div className="text-sys-color-text-primary flex items-center justify-between">
          <span>Total Balance</span>
          <span>{formatValue(totalBalance / 10 ** BTC_DECIMALS, 6)}</span>
        </div>
        <div className="text-sys-color-text-mute flex items-center justify-between pl-12">
          <span>Available UTXO Amount</span>
          <span>
            {formatValue(availableUtxoAmount / 10 ** BTC_DECIMALS, 6)}
          </span>
        </div>
        <div className="text-sys-color-text-mute flex items-center justify-between pl-12">
          <span>Unavailable UTXO Amount</span>
          <span>
            {formatValue(unavailableUtxoAmount / 10 ** BTC_DECIMALS, 6)}
          </span>
        </div>
      </div>
    </Tooltip>
  );
};
