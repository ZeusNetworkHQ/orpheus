import { useMemo } from "react";

import usePersistentStore from "@/stores/persistentStore";
import { createFetchers } from "@/utils/axios";

export const useFetchers = () => {
  const { solanaNetwork, bitcoinNetwork } = usePersistentStore();

  const fetchers = useMemo(
    () => createFetchers(solanaNetwork, bitcoinNetwork),
    [solanaNetwork, bitcoinNetwork]
  );

  return fetchers;
};
