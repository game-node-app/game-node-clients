import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "#@/components/auth/authClient";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";

/** Row of `GET /oauth2/get-consents` (better-auth oauth-provider `oauthConsent` model). */
export interface OAuthConsent {
  id: string;
  clientId: string;
  userId?: string | null;
  scopes: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Fields returned by `GET /oauth2/public-client`. */
export interface OAuthPublicClient {
  client_id: string;
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
}

/** A consent plus the public data of the app it was granted to (null when the client is gone). */
export interface OAuthConnectedApp extends OAuthConsent {
  client: OAuthPublicClient | null;
}

export function getOAuthConsentsKey(userId: string | undefined) {
  return ["settings", "mcp", "consents", userId ?? null];
}

function normalizeScopes(scopes: unknown): string[] {
  if (Array.isArray(scopes)) return scopes.filter((s) => typeof s === "string");
  if (typeof scopes === "string") return scopes.split(/\s+/).filter(Boolean);
  return [];
}

async function fetchPublicClient(clientId: string) {
  try {
    const { data } = await authClient.$fetch<OAuthPublicClient>(
      "/oauth2/public-client",
      { query: { client_id: clientId } },
    );
    return data ?? null;
  } catch {
    return null;
  }
}

/** Apps (OAuth clients, e.g. MCP assistants) the signed-in user granted access to. */
export function useOAuthConsents(): ExtendedUseQueryResult<
  OAuthConnectedApp[]
> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getOAuthConsentsKey(userId);
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery({
      queryKey,
      queryFn: async () => {
        const { data, error } = await authClient.$fetch<OAuthConsent[]>(
          "/oauth2/get-consents",
        );
        if (error) {
          throw new Error(error.message || error.statusText);
        }
        const consents = (data ?? []).map((consent) => ({
          ...consent,
          scopes: normalizeScopes(consent.scopes),
        }));
        const apps = await Promise.all(
          consents.map(async (consent) => ({
            ...consent,
            client: await fetchPublicClient(consent.clientId),
          })),
        );
        return apps.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
      },
      enabled: !!userId,
    }),
  };
}
