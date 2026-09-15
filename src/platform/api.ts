import { Platform } from "react-native";
import { ApiClientError, configureApiClient } from "@castadi/shared";
import { env } from "@/config/env";
import { queryClient } from "./queryClient";
import { toast } from "./toast";

export function setupApiClient() {
  configureApiClient({
    baseUrl: env.apiUrl,
    headers: { "X-Client-Platform": Platform.OS, "X-App-Version": env.appVersion },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Network error. Check your connection and try again.");
    },
    // The session is already cleared, so the root navigator's guard sends the user to login.
    onSessionExpired: () => {
      queryClient.clear();
      toast.error("Your session has expired. Please log in again.");
    },
  });
}
