import { session } from "@castadi/shared";
import { unregisterPushNotifications } from "./push";
import { queryClient } from "./queryClient";

// Clearing the whole cache matters on a shared device: the next account must never see the previous one's data.
export async function signOut() {
  // Before clearing the session: unregistering needs the access token, and the phone must stop getting this account's pushes.
  await unregisterPushNotifications();
  await session.clear();
  queryClient.clear();
}
