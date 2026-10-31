import type { QueryClient } from "@tanstack/react-query";
import { authClient } from "#@/components/auth/authClient";

/** Ends the session on the server (and, on native, deletes the stored token), then drops cached user data. */
export async function signOut(queryClient: QueryClient) {
  await authClient.signOut();
  queryClient.clear();
}
