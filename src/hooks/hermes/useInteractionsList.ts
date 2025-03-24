import { AxiosError } from "axios";
import useSWR from "swr";

import { useFetchers } from "@/hooks/misc/useFetchers";
import {
  interactionsSchema,
  interactionAccumulatedSchema,
  Interactions,
} from "@/types/api";
import { Fetcher } from "@/utils/axios";

export interface InteractionsData {
  totalInteractions: number;
  interactions: Interactions;
}

function useInteractionsList() {
  const { hermesFetcher } = useFetchers();
  const { data, mutate, error, isLoading } = useSWR<
    InteractionsData,
    AxiosError
  >(
    [
      "api/v1/aggregated/interactions/amount/accumulated",
      "api/v1/raw/layer/interactions?size=10",
      hermesFetcher,
    ],
    async ([interactionStatsUrl, interactionsUrl, fetcher]: [
      interactionStatsUrl: string,
      interactionsUrl: string,
      fetcher: Fetcher,
    ]) => {
      const interactionStats = await fetcher(
        interactionStatsUrl,
        interactionAccumulatedSchema
      );
      const interactions = await fetcher(interactionsUrl, interactionsSchema);

      return {
        totalInteractions: interactionStats.total_interactions_count,
        interactions,
      };
    },
    {
      refreshInterval: 30000,
      dedupingInterval: 30000,
    }
  );

  return {
    data,
    mutate,
    isLoading,
    error,
  };
}

export default useInteractionsList;
