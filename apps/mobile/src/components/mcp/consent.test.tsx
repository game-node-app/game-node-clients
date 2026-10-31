// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { OAuthConsentScreen } from "../../../../../packages/ui/src/components/auth/OAuthConsentScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { MCP_SCOPES } from "../../../../../packages/ui/src/components/mcp/connection";
import { renderMcp, setupDom, signedQuery } from "./testUtils";
const originalLocation = window.location;
const mocks = vi.hoisted(() => ({
  session: { user: { name: "Gamer", email: "gamer@example.com" } } as unknown,
  query: new URLSearchParams(),
  fetch: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: mocks.session, isPending: false }),
    $fetch: mocks.fetch,
  },
}));
vi.mock(
  "../../../../../packages/ui/src/components/general/avatar/UserAvatar",
  () => ({ UserAvatar: () => null }),
);
function renderConsent() {
  return renderMcp(
    <UIProvider
      hooks={{
        useRouter: () => ({
          pathname: "/oauth/consent",
          query: mocks.query,
          push: vi.fn(),
          back: vi.fn(),
        }),
      }}
    >
      <OAuthConsentScreen />
    </UIProvider>,
  );
}
beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  mocks.session = { user: { name: "Gamer", email: "gamer@example.com" } };
  mocks.query = signedQuery();
  mocks.fetch.mockImplementation(async (path: string) =>
    path === "/oauth2/public-client"
      ? {
          data: {
            client_name: "Assistant",
            client_uri: "https://self-declared.example",
          },
        }
      : {
          data: {
            redirect: true,
            url: "http://127.0.0.1:1234/callback?code=server-only",
          },
        },
  );
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { origin: "https://gamenode.app", assign: mocks.navigate },
  });
});
afterEach(() => {
  cleanup();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});
describe("server-backed consent", () => {
  it("identifies account and the CIMD domain as verified", async () => {
    renderConsent();
    await screen.findByRole("heading", {
      name: "Assistant wants to access your GameNode account",
    });
    expect(mocks.fetch).toHaveBeenCalledWith("/oauth2/public-client", {
      query: { client_id: mocks.query.get("client_id") },
    });
    expect(screen.getByText(/Gamer.*gamer@example.com/)).toBeTruthy();
    expect(screen.getByText("client.example")).toBeTruthy();
    expect(screen.getByText("Verified domain")).toBeTruthy();
    expect(screen.queryByText("self-declared.example")).toBeNull();
  });
  it("marks clients without a metadata domain as unverified", async () => {
    mocks.query.set("client_id", "opaque-client");
    mocks.fetch.mockResolvedValue({ data: {} });
    renderConsent();
    await screen.findByRole("button", { name: "Allow" });
    expect(screen.getByText("opaque-client")).toBeTruthy();
    expect(screen.getByText("Unverified domain")).toBeTruthy();
    expect(screen.getByText(/does not have a verified domain/)).toBeTruthy();
  });
  it("escapes HTML-like metadata and never links unsafe URIs", async () => {
    mocks.fetch.mockResolvedValue({
      data: {
        client_name: '<img src=x onerror="alert(1)">',
        client_uri: "javascript:alert(1)",
      },
    });
    const view = renderConsent();
    await screen.findByRole("heading", {
      name: '<img src=x onerror="alert(1)"> wants to access your GameNode account',
    });
    expect(view.container.querySelector("img[onerror]")).toBeNull();
    expect(
      screen.queryByRole("link", { name: "javascript:alert(1)" }),
    ).toBeNull();
  });
  it("blocks approval after metadata failure and supports retry", async () => {
    mocks.fetch.mockResolvedValueOnce({ error: { status: 404 } });
    renderConsent();
    await screen.findByRole("alert");
    expect(screen.queryByRole("button", { name: "Allow" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByRole("button", { name: "Allow" });
  });
  it("shows only read permissions for a read request", async () => {
    renderConsent();
    await screen.findByRole("button", { name: "Allow" });
    expect(
      screen.getByText("Read your library entries and list your collections."),
    ).toBeTruthy();
    expect(screen.queryByText("Write on your behalf")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
  it("explains all scopes and only grants the checked ones", async () => {
    mocks.query.set("scope", [...MCP_SCOPES, "future:scope"].join(" "));
    renderConsent();
    await screen.findByRole("button", { name: "Allow" });
    for (const scope of MCP_SCOPES)
      expect(screen.getByText(scope)).toBeTruthy();
    expect(
      screen.getByText(
        "Permission requested by this application: future:scope.",
      ),
    ).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    // Every scope starts checked; unchecking one drops it from the grant.
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Add and update entries in your library.",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Allow" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    expect(mocks.fetch.mock.calls[1][1].body.scope).toBe(
      "games:read library:read reviews:write posts:write openid profile offline_access future:scope",
    );
  });
  it.each([true, false])(
    "submits the explicit decision %s with exact signed context",
    async (accept) => {
      const original = mocks.query.toString();
      mocks.query.append("error", "ignored");
      renderConsent();
      fireEvent.click(
        await screen.findByRole("button", {
          name: accept ? "Allow" : "Deny",
        }),
      );
      await waitFor(() =>
        expect(mocks.navigate).toHaveBeenCalledWith(
          "http://127.0.0.1:1234/callback?code=server-only",
        ),
      );
      expect(mocks.fetch).toHaveBeenLastCalledWith("/oauth2/consent", {
        method: "POST",
        body: {
          accept,
          ...(accept ? { scope: "games:read library:read" } : {}),
          oauth_query: original,
        },
      });
    },
  );
  it("disables both decisions during submission and follows native callbacks", async () => {
    let resolve!: (value: unknown) => void;
    mocks.fetch
      .mockImplementationOnce(async () => ({
        data: { client_name: "Assistant" },
      }))
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
    renderConsent();
    const authorize = await screen.findByRole("button", { name: "Allow" });
    fireEvent.click(authorize);
    fireEvent.click(authorize);
    expect((authorize as HTMLButtonElement).disabled).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Deny" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    resolve({
      data: { redirect: true, url: "assistant://callback?code=server-only" },
    });
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(
        "assistant://callback?code=server-only",
      ),
    );
  });
  it.each(["network", "expired"])(
    "does not navigate on %s errors and permits an explicit retry",
    async (type) => {
      mocks.fetch
        .mockImplementationOnce(async () => ({
          data: { client_name: "Assistant" },
        }))
        .mockImplementationOnce(async () => {
          if (type === "network") throw new Error("offline");
          return { error: { status: 400 } };
        });
      renderConsent();
      fireEvent.click(await screen.findByRole("button", { name: "Allow" }));
      const alert = await screen.findByRole("alert");
      expect(mocks.navigate).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(alert);
      fireEvent.click(screen.getByRole("button", { name: "Allow" }));
      await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    },
  );
  it.each([
    new URLSearchParams(),
    new URLSearchParams("client_id=evil&sig=fake"),
  ])("rejects direct malformed visits", (query) => {
    mocks.query = query;
    renderConsent();
    expect(screen.getByRole("alert").textContent).toContain("invalid");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Allow" })).toBeNull();
  });
  it("preserves the request when a session is missing", () => {
    mocks.session = null;
    renderConsent();
    expect(
      screen
        .getByRole("link", { name: "Sign in to continue" })
        .getAttribute("href"),
    ).toBe(`/auth?${signedQuery()}`);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("returns to sign-in with context when a session expires during submission", async () => {
    mocks.fetch
      .mockImplementationOnce(async () => ({
        data: { client_name: "Assistant" },
      }))
      .mockResolvedValueOnce({ error: { status: 401 } });
    renderConsent();
    fireEvent.click(await screen.findByRole("button", { name: "Allow" }));
    expect(
      (
        await screen.findByRole("link", { name: "Sign in to continue" })
      ).getAttribute("href"),
    ).toBe(`/auth?${signedQuery()}`);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
