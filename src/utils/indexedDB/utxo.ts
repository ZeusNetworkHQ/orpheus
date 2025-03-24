import { UTXOs } from "@/types/api";

import { initDB, UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME } from ".";

export type TransactionUtxoCaches = {
  transactionId: string;
  utxos: UTXOs;
}[];

class UTXORepo {
  async getUTXOs(bitcoinAddress: string): Promise<TransactionUtxoCaches> {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME],
        "readonly"
      );

      const store = transaction.objectStore(
        UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME
      );

      const getRequest = store.get(bitcoinAddress);

      getRequest.onsuccess = (event) => {
        const result = (event?.target as IDBRequest)?.result;
        if (!result || !result.data) {
          resolve([]);
          return;
        }

        resolve(result.data);
      };

      getRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async addUTXOs(
    bitcoinAddress: string,
    transactionId: string,
    utxos: UTXOs
  ): Promise<void> {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME],
        "readwrite"
      );

      const store = transaction.objectStore(
        UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME
      );

      const getRequest = store.get(bitcoinAddress);

      getRequest.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        const previousData: TransactionUtxoCaches = result?.data || [];

        const isDuplicate = previousData.some(
          (data) => data.transactionId === transactionId
        );

        if (isDuplicate) {
          resolve();
          return;
        }

        const newData = [
          ...previousData,
          {
            transactionId,
            utxos,
          },
        ];

        const putRequest = store.put({
          bitcoinAddress,
          data: newData,
        });

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      };

      getRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async deleteUTXOs(
    bitcoinAddress: string,
    transactionId: string
  ): Promise<void> {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME],
        "readwrite"
      );

      const store = transaction.objectStore(
        UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME
      );

      const getRequest = store.get(bitcoinAddress);

      getRequest.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;

        if (!result || !result.data) {
          resolve();
          return;
        }

        const previousData: TransactionUtxoCaches = result.data ?? [];

        const filteredData = previousData.filter(
          (data) => data.transactionId !== transactionId
        );

        if (filteredData.length === previousData.length) {
          resolve();
          return;
        }

        const putRequest = store.put({
          bitcoinAddress,
          data: filteredData,
        });

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      };

      getRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}

const utxoRepo = new UTXORepo();

export default utxoRepo;
