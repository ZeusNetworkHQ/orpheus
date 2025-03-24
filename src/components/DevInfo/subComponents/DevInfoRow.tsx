import Link from "next/link";
import { useCallback } from "react";

import { useNetworkConfig } from "@/hooks/misc/useNetworkConfig";
import usePersistentStore from "@/stores/persistentStore";
import { LINK_TYPE } from "@/utils/constant";
import { getSolanaExplorerUrl, handleCopy } from "@/utils/misc";

import CopyIcon from "../../Icons/icons/Copy";

const DevInfoRow = ({
  value,
  linkType,
  withIcon,
}: {
  value: string;
  linkType: keyof typeof LINK_TYPE;
  withIcon: boolean;
}) => {
  const solanaNetwork = usePersistentStore((state) => state.solanaNetwork);
  const networkConfig = useNetworkConfig();

  const getLink = useCallback(
    (value: string | undefined, linkType: keyof typeof LINK_TYPE) => {
      switch (linkType) {
        case LINK_TYPE.SOLANA:
          return getSolanaExplorerUrl(solanaNetwork, "address", value);
        case LINK_TYPE.BITCOIN:
          return `${networkConfig.bitcoinExplorerUrl}/address/${value}`;
        case LINK_TYPE.API:
          return value || "";
        default:
          return value || "";
      }
    },
    [solanaNetwork, networkConfig]
  );

  if (withIcon) {
    return (
      <div
        key={value}
        className="relative flex cursor-pointer gap-x-2 text-shade-mute"
      >
        <div
          onClick={() => handleCopy(value)}
          className="mt-0.5 hover:text-shade-secondary"
        >
          <CopyIcon />
        </div>
        <Link
          href={getLink(value, linkType)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="w-full break-all">{value}</div>
        </Link>
      </div>
    );
  } else {
    return <div className="text-shade-mute">{value}</div>;
  }
};

export default DevInfoRow;
