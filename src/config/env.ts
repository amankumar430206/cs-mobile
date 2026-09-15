import * as Application from "expo-application";
import Constants from "expo-constants";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env.local and fill it in.`);
  return value;
}

export const env = {
  // Must stay a literal `process.env.EXPO_PUBLIC_*` reference so Metro inlines it.
  apiUrl: required("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL).replace(/\/+$/, ""),
  appVersion: Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "0.0.0",
  variant: (Constants.expoConfig?.extra?.variant as string | undefined) ?? "development",
};
