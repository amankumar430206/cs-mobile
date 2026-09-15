import { Redirect } from "expo-router";
import { useMeQuery } from "@castadi/shared/hooks";

// The (app) layout only renders once the user is loaded and has a supported role.
export default function AppIndex() {
  const me = useMeQuery();
  return <Redirect href={me.data?.role === "SCREEN_PARTNER" ? "/partner" : "/advertiser"} />;
}
