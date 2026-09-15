import { session } from "@castadi/shared";
import { queryClient } from "./queryClient";

// Clearing the whole cache matters on a shared device: the next account must never see the previous one's data.
export async function signOut() {
  await session.clear();
  queryClient.clear();
}
