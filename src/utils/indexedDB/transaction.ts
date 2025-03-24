import { Interaction } from "@/types/api";
import { BitcoinNetwork } from "@/types/store";

import { initDB, REGTEST_BITCOIN_TRANSACTIONS_STORE_NAME } from ".";

class TransactionRepo {
  private getKey(bitcoinNetwork: BitcoinNetwork) {
    switch (bitcoinNetwork) {
      case BitcoinNetwork.Regtest:
        return REGTEST_BITCOIN_TRANSACTIONS_STORE_NAME;
      default:
        return REGTEST_BITCOIN_TRANSACTIONS_STORE_NAME;
    }
  }

  async addInteraction(
    bitcoinNetwork: BitcoinNetwork,
    solanaAddress: string,
    interaction: Interaction
  ): Promise<void> {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const key = this.getKey(bitcoinNetwork);

      const transaction = db.transaction([key], "readwrite");

      const store = transaction.objectStore(key);

      const getRequest = store.get(solanaAddress);

      getRequest.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        const previousData: Interaction[] = result?.data || [];

        const isDuplicate = previousData.some(
          (existingInteraction) =>
            existingInteraction.interaction_id === interaction.interaction_id
        );

        if (isDuplicate) {
          resolve();
          return;
        }

        const newData = [...previousData, interaction];
        const putRequest = store.put({ solanaAddress, data: newData });

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

  async updateInteractions(
    bitcoinNetwork: BitcoinNetwork,
    solanaAddress: string,
    interactions: Interaction[]
  ): Promise<void> {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const key = this.getKey(bitcoinNetwork);

      const transaction = db.transaction([key], "readwrite");

      const store = transaction.objectStore(key);

      const putRequest = store.put({ solanaAddress, data: interactions });

      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getInteractions(
    bitcoinNetwork: BitcoinNetwork,
    solanaAddress: string
  ): Promise<Interaction[] | undefined> {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const key = this.getKey(bitcoinNetwork);

      const transaction = db.transaction([key], "readonly");

      const store = transaction.objectStore(key);

      const getRequest = store.get(solanaAddress);

      getRequest.onsuccess = (event) => {
        const result = (event?.target as IDBRequest)?.result;
        resolve(result?.data);
      };

      getRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}

const transactionRepo = new TransactionRepo();

export default transactionRepo;
