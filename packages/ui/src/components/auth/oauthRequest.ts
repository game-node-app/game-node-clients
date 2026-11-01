import { authClient } from "./authClient";

export function hasOAuthRequest(query: URLSearchParams) {
  return query.has("sig") || query.has("ba_param") || query.has("client_id");
}

export function getOAuthRequest(query: URLSearchParams) {
  const names = new Set(query.getAll("ba_param"));
  if (!query.get("sig") || !names.size) return null;
  // Match the provider client's signed-parameter filter; keep every repeated value.
  const signed = new URLSearchParams();
  for (const [key, value] of query) {
    if (key === "sig" || key === "ba_param" || names.has(key))
      signed.append(key, value);
  }
  for (const key of ["client_id", "scope", "redirect_uri", "exp", "ba_iat"]) {
    if (signed.getAll(key).length !== 1 || !signed.get(key)) return null;
  }
  if (
    !Number.isFinite(Number(signed.get("exp"))) ||
    !Number.isFinite(Number(signed.get("ba_iat")))
  )
    return null;
  return {
    oauthQuery: signed.toString(),
    clientId: signed.get("client_id")!,
    scope: signed.get("scope")!,
  };
}

export interface OAuthDestination {
  redirect: boolean;
  url: string;
}

export function followOAuthDestination(data: OAuthDestination | null) {
  if (!data?.redirect || !data.url)
    throw new Error("Missing authorization destination");
  window.location.assign(data.url);
}

export async function continueOAuth(oauthQuery: string) {
  const { data, error } = await authClient.$fetch<OAuthDestination>(
    "/oauth2/continue",
    {
      method: "POST",
      body: { selected: true, oauth_query: oauthQuery },
    },
  );
  if (error || !data?.redirect || !data.url)
    throw new Error("Authorization continuation failed");
  return data;
}
