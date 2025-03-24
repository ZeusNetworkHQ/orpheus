import { useMemo } from "react";

import usePersistentStore from "@/stores/persistentStore";
import { getNetworkConfig } from "@/utils/network";

export const useNetworkConfig = () => {
  const solanaNetwork = usePersistentStore((state) => state.solanaNetwork);
  const bitcoinNetwork = usePersistentStore((state) => state.bitcoinNetwork);

  const config = useMemo(
    () => getNetworkConfig(solanaNetwork, bitcoinNetwork),
    [solanaNetwork, bitcoinNetwork]
  );
  return config;
};
