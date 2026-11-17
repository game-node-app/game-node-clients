import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nativeFetch, routeApiThroughNativeHttp } from "./nativeApiFetch";

const native = vi.hoisted(() => vi.fn());
vi.mock("@capacitor/core", () => ({ CapacitorHttp: { request: native } }));

const SERVER = "https://server.gamenode.app";
const SEARCH = "https://search.gamenode.app/";

describe("routeApiThroughNativeHttp", () => {
  const webFetch = vi.fn(async () => new Response("web"));

  beforeEach(() => {
    native.mockResolvedValue({
      status: 200,
      headers: { "content-type": "application/json" },
      data: { id: 1942 },
      url: "",
    });
    vi.stubGlobal("window", { fetch: webFetch });
    routeApiThroughNativeHttp([SERVER, SEARCH]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("sends JSON API calls natively and rebuilds the response", async () => {
    const response = await window.fetch(`${SERVER}/v1/game/repository/1942`, {
      method: "POST",
      headers: {
        Authorization: "Bearer t",
        "Content-Type": "application/json",
      },
      body: '{"relations":{}}',
    });

    expect(webFetch).not.toHaveBeenCalled();
    expect(native).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${SERVER}/v1/game/repository/1942`,
        method: "POST",
        data: '{"relations":{}}',
        headers: {
          authorization: "Bearer t",
          "content-type": "application/json",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toEqual({ id: 1942 });
  });

  it("routes the search API natively too", async () => {
    await window.fetch(`${SEARCH}v1/search/games`, {
      method: "POST",
      body: "{}",
    });
    expect(native).toHaveBeenCalled();
  });

  it("keeps auth, uploads and other hosts on the WebView fetch", async () => {
    await window.fetch(`${SERVER}/v1/auth/get-session`);
    await window.fetch(`${SERVER}/v1/profile/image`, {
      method: "POST",
      body: new FormData(),
    });
    await window.fetch("https://example.com/v1/x");
    await window.fetch("data:image/png;base64,AA==");

    expect(native).not.toHaveBeenCalled();
    expect(webFetch).toHaveBeenCalledTimes(4);
  });
});

describe("nativeFetch", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty body for 204", async () => {
    native.mockResolvedValue({ status: 204, headers: {}, data: "", url: "" });
    const response = await nativeFetch(`${SERVER}/v1/statistics/like`, {
      method: "PUT",
    });
    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });

  it("passes 4xx responses through like fetch", async () => {
    native.mockResolvedValue({
      status: 401,
      headers: { "content-type": "text/plain" },
      data: "nope",
      url: "",
    });
    const response = await nativeFetch(`${SERVER}/v1/x`);
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("nope");
  });

  it("turns native failures into a fetch-style TypeError", async () => {
    native.mockRejectedValue(new Error("offline"));
    await expect(nativeFetch(`${SERVER}/v1/x`)).rejects.toBeInstanceOf(
      TypeError,
    );
  });

  it("rejects when the request is aborted", async () => {
    native.mockReturnValue(new Promise(() => {}));
    const controller = new AbortController();
    const pending = nativeFetch(`${SERVER}/v1/x`, {
      signal: controller.signal,
    });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
