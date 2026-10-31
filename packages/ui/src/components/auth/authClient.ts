import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Explicit types: inferred ones reference better-auth's nested zod, which apps with `declaration` can't name (TS2742).
export interface AuthClientOptions {
  baseURL: string;
  basePath: string;
  plugins: ReturnType<typeof adminClient>[];
  fetchOptions: { credentials: "include" };
}
export type AuthClient = ReturnType<typeof createAuthClient<AuthClientOptions>>;

/** Base options shared by every app; mobile wraps them with `withCapacitor` on native. */
export const getAuthClientOptions = (baseURL: string): AuthClientOptions => ({
  baseURL,
  basePath: "/v1/auth",
  plugins: [adminClient()],
  fetchOptions: { credentials: "include" },
});

/** Set once by `setupAuthClient`, the same way apps call `setupWrapper`. */
export let authClient: AuthClient = undefined as unknown as AuthClient;

export function setupAuthClient(options: AuthClientOptions) {
  authClient = createAuthClient(options);
}
