const DB_NAME = "OrpheusDB";
const DB_VERSION = 4;

export const REGTEST_BITCOIN_TRANSACTIONS_STORE_NAME =
  "regtestBitcoinTransactions";

export const UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME = "unconfirmedBitcoinUtxos";

const storeNames = [
  REGTEST_BITCOIN_TRANSACTIONS_STORE_NAME,
  UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME,
];

let db: IDBDatabase | null;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) =>
      reject((event.target as IDBOpenDBRequest).error);

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      storeNames.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath:
              storeName === UNCONFIRMED_BITCOIN_UTXOS_STORE_NAME
                ? "bitcoinAddress"
                : "solanaAddress",
          });
        }
      });
    };
  });
}
