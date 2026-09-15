import * as SecureStore from "expo-secure-store";
import type { TokenStorage } from "@castadi/shared";

// Separate keys: some Android keystores cap a single SecureStore value near 2KB,
// and two RS256 JWTs together get close to that.
const ACCESS_KEY = "castadi.accessToken";
const REFRESH_KEY = "castadi.refreshToken";
const options: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };

export const secureTokenStorage: TokenStorage = {
  async load() {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY, options),
      SecureStore.getItemAsync(REFRESH_KEY, options),
    ]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },
  async save(tokens) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken, options),
      SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken, options),
    ]);
  },
  async clear() {
    await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY, options), SecureStore.deleteItemAsync(REFRESH_KEY, options)]);
  },
};
