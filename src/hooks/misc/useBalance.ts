import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import useSWR from "swr";

import { useNetworkConfig } from "./useNetworkConfig";

const balanceFetcher = async (
  publickey: PublicKey,
  connection: Connection,
  mint: PublicKey
) => {
  try {
    const ata = await getAssociatedTokenAddress(mint, publickey, true);
    const accountData = await getAccount(connection, ata);

    return new BigNumber(accountData.amount.toString());
  } catch {
    return new BigNumber(0);
  }
};

const useBalance = (solanaPubkey: PublicKey | null) => {
  const config = useNetworkConfig();
  const { connection } = useConnection();
  const { data, isLoading, mutate } = useSWR<BigNumber>(
    solanaPubkey && connection
      ? [solanaPubkey.toBase58(), connection, config.assetMint, "balance"]
      : null,
    async ([pubkeyStr, conn, mint]: [string, Connection, string]) =>
      balanceFetcher(new PublicKey(pubkeyStr), conn, new PublicKey(mint)),
    {
      keepPreviousData: true,
      refreshInterval: 30000,
      dedupingInterval: 30000,
    }
  );

  return {
    data: data ?? new BigNumber(0),
    isLoading,
    mutate,
  };
};

export default useBalance;
