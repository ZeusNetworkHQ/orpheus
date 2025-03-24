import { AxiosError } from "axios";
import useSWR from "swr";

import useCursorPagination from "@/hooks/misc/useCursorPagination";
import { useFetchers } from "@/hooks/misc/useFetchers";
import {
  Interactions,
  interactionsSchema,
  InteractionStatus,
} from "@/types/api";
import { InteractionType } from "@/types/api";
import { Fetcher } from "@/utils/axios";

function useInteractions(
  query: {
    solanaAddress?: string;
    sourceBitcoinAddress?: string;
    destinationBitcoinAddress?: string;
    timestamp?: number;
    types?: InteractionType[];
    statuses?: InteractionStatus[];
  },
  defaultItemsPerPage?: number
) {
  const { hermesFetcher } = useFetchers();

  const {
    currentCursor,
    itemsPerPage,
    currentPage,
    handleNextPage,
    handlePrevPage,
    handleResetPage,
    handleItemsPerPage,
  } = useCursorPagination(defaultItemsPerPage);

  const {
    data: interactions,
    mutate,
    error,
    isLoading,
  } = useSWR<Interactions, AxiosError>(
    query?.solanaAddress
      ? [
          hermesFetcher,
          "/api/v1/raw/layer/interactions",
          itemsPerPage,
          currentCursor,
          query?.solanaAddress,
          query?.sourceBitcoinAddress,
          query?.destinationBitcoinAddress,
          query?.timestamp,
          query?.types,
          query?.statuses,
        ]
      : null,
    ([
      fetcher,
      baseUrl,
      size,
      cursor,
      solanaAddress,
      sourceBitcoinAddress,
      destinationBitcoinAddress,
      timestamp,
      types,
      statuses,
    ]: [
      Fetcher,
      string,
      number,
      string,
      string,
      string,
      string,
      number,
      InteractionType[],
      InteractionStatus[],
    ]) => {
      let url = `${baseUrl}?size=${size}`;
      if (cursor) url += `&cursor=${cursor}`;
      if (solanaAddress) url += `&solana_address=${solanaAddress}`;
      if (sourceBitcoinAddress)
        url += `&source_bitcoin_address=${sourceBitcoinAddress}`;
      if (destinationBitcoinAddress)
        url += `&destination_bitcoin_address=${destinationBitcoinAddress}`;
      if (timestamp) url += `&initiated_at=${timestamp}`;
      if (types?.length) {
        url += "&types=" + types.join(",");
      }
      if (statuses?.length) {
        url += "&statuses=" + statuses.join(",");
      }
      return fetcher(url, interactionsSchema);
    },
    {
      refreshInterval: 10000,
      dedupingInterval: 10000,
    }
  );

  return {
    data: interactions?.items ?? [],
    mutate,
    hasNextPage: !!interactions?.cursor,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    handleNextPage: handleNextPage(interactions?.cursor),
    handlePrevPage,
    handleResetPage,
    handleItemsPerPage,
  };
}

export default useInteractions;
