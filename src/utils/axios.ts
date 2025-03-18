import axios, {
  AxiosError,
  AxiosResponse,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { ZodError, ZodType } from "zod";

import { ZeusBackendResponse } from "@/types/api";
import { BitcoinNetwork, SolanaNetwork } from "@/types/store";
import { getNetworkConfig } from "@/utils/network";

const onRequest = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => config;

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[Request error] [${JSON.stringify(error)}]`);
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => response;

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  if (!error.response) {
    console.error(`[Network error] [${JSON.stringify(error)}]`);
  } else {
    console.error(`[Response error] [${JSON.stringify(error.response.data)}]`);
  }
  return Promise.reject(error);
};

const setupInterceptors = (axiosInstance: AxiosInstance): AxiosInstance => {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
};

const handleFetcherError = (error: unknown, fetcher: string) => {
  if (error instanceof ZodError) {
    console.error(`[${fetcher} parse error] [${error.message}]`);
  } else if (!(error instanceof AxiosError)) {
    console.error(`[${fetcher} unexpected error] [${JSON.stringify(error)}]`);
  }
};

// Axios instances
export const createAxiosInstances = (
  solanaNetwork: SolanaNetwork,
  bitcoinNetwork: BitcoinNetwork
) => {
  const config = getNetworkConfig(solanaNetwork, bitcoinNetwork);

  const binanceApi = setupInterceptors(
    axios.create({
      baseURL: config.binanceUrl,
      timeout: 10000,
    })
  );

  const aegleApi = setupInterceptors(
    axios.create({
      baseURL: config.aegleUrl,
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  );

  const aresApi = setupInterceptors(
    axios.create({
      baseURL: config.aresUrl,
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  );

  const hermesApi = setupInterceptors(
    axios.create({
      baseURL: config.hermesUrl,
      timeout: 20000,
    })
  );

  return { binanceApi, aegleApi, aresApi, hermesApi };
};

// Fetchers
export const createFetchers = (
  solanaNetwork: SolanaNetwork,
  bitcoinNetwork: BitcoinNetwork
) => {
  const { binanceApi, hermesApi, aegleApi, aresApi } = createAxiosInstances(
    solanaNetwork,
    bitcoinNetwork
  );

  const binanceFetcher = async <T>(
    url: string,
    schema: ZodType<T>
  ): Promise<T> => {
    try {
      const response = await binanceApi.get<T>(url);
      return schema.parse(response.data);
    } catch (e) {
      handleFetcherError(e, "Binance fetcher");
      throw e;
    }
  };

  const hermesFetcher = async <T>(
    url: string,
    schema: ZodType<T>
  ): Promise<T> => {
    try {
      const response = await hermesApi.get<ZeusBackendResponse<T>>(url);
      return schema.parse(response.data.data);
    } catch (e) {
      handleFetcherError(e, "Hermes fetcher");
      throw e;
    }
  };

  const aegleFetcher = async <T>(
    url: string,
    schema: ZodType<T>
  ): Promise<T> => {
    try {
      const response = await aegleApi.get<ZeusBackendResponse<T>>(url);
      return schema.parse(response.data.data);
    } catch (e) {
      handleFetcherError(e, "Aegle fetcher");
      throw e;
    }
  };

  const aresFetcher = async <T>(
    url: string,
    schema: ZodType<T>
  ): Promise<T> => {
    try {
      const response = await aresApi.get<ZeusBackendResponse<T>>(url);
      return schema.parse(response.data.data);
    } catch (e) {
      handleFetcherError(e, "Ares fetcher");
      throw e;
    }
  };

  return {
    binanceFetcher,
    hermesFetcher,
    aegleFetcher,
    aresFetcher,
  };
};

export type Fetcher = <T>(url: string, schema: ZodType<T>) => Promise<T>;
