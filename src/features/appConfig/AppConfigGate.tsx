import { useEffect, type ReactNode } from "react";
import { Alert, Linking, Platform } from "react-native";
import { compareAppVersions, useAppConfigQuery, type AppConfig } from "@castadi/shared/hooks";
import { env } from "@/config/env";
import { Button, StatusView } from "@/ui";

// Once per app launch, not on every refetch.
let updatePromptShown = false;

const storeUrl = (config: AppConfig) => (Platform.OS === "ios" ? config.iosStoreUrl : config.androidStoreUrl);

/**
 * Launch check against cs-api's GET /settings/app-config: maintenance mode and versions below the minimum block the
 * app; a newer version only prompts. If the check fails or hasn't answered yet, the app runs normally — a flaky
 * network must never lock anyone out.
 */
export function AppConfigGate({ children }: { children: ReactNode }) {
  const appConfig = useAppConfigQuery();
  const config = appConfig.data;
  const url = config ? storeUrl(config) : null;

  const belowMinimum = !!config && compareAppVersions(env.appVersion, config.minSupportedVersion) < 0;
  const updateAvailable = !!config && !belowMinimum && compareAppVersions(env.appVersion, config.latestVersion) < 0;

  useEffect(() => {
    if (!updateAvailable || !url || updatePromptShown) return;
    updatePromptShown = true;
    Alert.alert("Update available", "A new version of CASTADI is available with the latest improvements.", [
      { text: "Later", style: "cancel" },
      { text: "Update", onPress: () => void Linking.openURL(url) },
    ]);
  }, [updateAvailable, url]);

  if (config?.maintenanceEnabled) {
    return (
      <StatusView
        title="We'll be right back"
        message={config.maintenanceMessage || "CASTADI is undergoing scheduled maintenance. Please try again shortly."}
      >
        <Button title="Try again" loading={appConfig.isFetching} onPress={() => void appConfig.refetch()} />
      </StatusView>
    );
  }

  if (belowMinimum) {
    return (
      <StatusView
        title="Update required"
        message={`This version of CASTADI (${env.appVersion}) is no longer supported. Update to continue.`}
      >
        {url ? <Button title="Update now" onPress={() => void Linking.openURL(url)} /> : null}
      </StatusView>
    );
  }

  return children;
}
