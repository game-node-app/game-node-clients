import { CapacitorHttp } from "@capacitor/core";

/**
 * Sends the generated API client's requests through the native HTTP stack.
 *
 * From the WebView (origin `https://localhost`) every API call is cross-origin and carries an
 * `Authorization` header, so the browser sends a CORS preflight before each new URL: one extra
 * round trip (~200 ms from Brazil). Native requests have no CORS, so no preflight.
 *
 * better-auth calls go native too: the server's `capacitor()` plugin turns the `capacitor-origin`
 * header into `Origin`. FormData/Blob uploads keep the WebView fetch because CapacitorHttp re-encodes them.
 */
export function routeApiThroughNativeHttp(baseUrls: string[]) {
  const webFetch = window.fetch.bind(window);
  const bases = baseUrls.map((url) => url.replace(/\/$/, ""));

  window.fetch = (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : undefined;
    const body = init?.body;
    const native =
      url != undefined &&
      (body == undefined || typeof body === "string") &&
      bases.some((base) => url.startsWith(`${base}/`));

    return native ? nativeFetch(url, init) : webFetch(input, init);
  };
}

export async function nativeFetch(
  url: string,
  init: Parameters<typeof fetch>[1] = {},
): Promise<Response> {
  const signal = init.signal;
  signal?.throwIfAborted();

  const request = CapacitorHttp.request({
    url,
    method: init.method ?? "GET",
    headers: Object.fromEntries(new Headers(init.headers).entries()),
    // A string body is sent as-is; only `file`/`formData` data types are re-encoded natively.
    data: init.body ?? undefined,
    responseType: "text",
  });

  // CapacitorHttp can't cancel; reject so the caller stops waiting.
  const aborted = new Promise<never>((_, reject) =>
    signal?.addEventListener("abort", () => reject(signal.reason), {
      once: true,
    }),
  );

  let response: Awaited<typeof request>;
  try {
    response = await Promise.race([request, aborted]);
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new TypeError("Failed to fetch", { cause: error });
  }

  // Native layers parse JSON responses regardless of responseType.
  const data =
    response.data == undefined || typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data);
  const noBody = [204, 205, 304].includes(response.status);

  return new Response(noBody ? null : data, {
    status: response.status,
    headers: response.headers,
  });
}
