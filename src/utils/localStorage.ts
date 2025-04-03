export const CUSTOM_SOLANA_DEVNET_RPC_KEY = "customSolanaDevnetRpcUrl";

/**
 * Get item from localStorage
 * @param key - Storage key
 * @returns The stored value or null if not found
 */
interface StorageItem<T> {
  value: T;
  expiry?: number;
}

/**
 * Remove item from localStorage
 * @param key - Storage key
 */
export const removeLocalStorage = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};

/**
 * Get item from localStorage with TTL support
 * @param key - Storage key
 * @returns The stored value or null if not found or expired
 */
export const getLocalStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const storageItem: StorageItem<T> = JSON.parse(item);

    if (storageItem.expiry && storageItem.expiry < Date.now()) {
      removeLocalStorage(key);
      return null;
    }

    return storageItem.value;
  } catch (error) {
    console.error("Error getting from localStorage:", error);
    return null;
  }
};

/**
 * Set item to localStorage with optional TTL
 * @param key - Storage key
 * @param value - Value to store
 * @param ttlMs - Time to live in milliseconds (optional)
 */
export const setLocalStorage = <T>(
  key: string,
  value: T,
  ttlMs?: number
): void => {
  if (typeof window === "undefined") return;

  try {
    const storageItem: StorageItem<T> = {
      value,
      ...(ttlMs && { expiry: Date.now() + ttlMs }),
    };
    window.localStorage.setItem(key, JSON.stringify(storageItem));
  } catch (error) {
    console.error("Error setting to localStorage:", error);
  }
};
