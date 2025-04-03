"use client";

import { DEFAULT_LAYER_FEE, SOLANA_TX_FEE_IN_SOL } from "@/utils/constant";

import usePrice from "./usePrice";

export function useSolanaData() {
  const { price: solPrice } = usePrice("SOLUSDC");

  const isLoading = !solPrice;

  const layerFeeInUSD = DEFAULT_LAYER_FEE * solPrice;

  const feePerTxInUSD = SOLANA_TX_FEE_IN_SOL * solPrice;

  return {
    solPrice,
    layerFeeInUSD,
    feePerTxInUSD,
    isLoading,
  };
}

export default useSolanaData;
