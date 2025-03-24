import { AxiosInstance } from "axios";

export const sendTransaction = async (
  aresApi: AxiosInstance,
  rawTx: string
): Promise<string> => {
  const res = await aresApi.post("/api/v1/transaction/broadcast", rawTx, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const txId = res.data.data;

  return txId;
};
