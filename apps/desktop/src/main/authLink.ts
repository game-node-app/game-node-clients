export function parseAuthLink(
  value: string,
  expectedCallback?: string,
): { token: string } | { error: string } | undefined {
  try {
    const url = new URL(value);
    if (
      !expectedCallback ||
      url.protocol !== "app.gamenode:" ||
      `${url.protocol}//${url.host}${url.pathname}` !== expectedCallback ||
      url.username ||
      url.password
    )
      return;
    const error = url.searchParams.get("error");
    if (error) return { error };
    const cookie = url.searchParams.get("cookie");
    const match = cookie?.match(
      /(?:^|[;,]\s*)(?:__Secure-)?better-auth\.session_token=([^;,\s]+)/,
    );
    if (!match) return { error: "Sign-in returned no session token" };
    const token = decodeURIComponent(match[1]);
    return token && !/[\s\p{Cc}]/u.test(token)
      ? { token }
      : { error: "Invalid session token" };
  } catch {
    return undefined;
  }
}
