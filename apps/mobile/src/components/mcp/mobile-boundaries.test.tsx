// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Router, Switch } from "react-router";
import { createMemoryHistory } from "history";
import AppUrlListener from "../general/AppUrlListener";
import McpPage from "../../pages/mcp";
import { getTabAwareHref } from "../../util/getTabAwareHref";
const mocks = vi.hoisted(() => ({
  open: vi.fn(),
  close: vi.fn(),
  addListener: vi.fn(),
  remove: vi.fn(),
  notify: vi.fn(),
}));
vi.mock("@capacitor/app", () => ({ App: { addListener: mocks.addListener } }));
vi.mock("@capacitor/browser", () => ({
  Browser: { open: mocks.open, close: mocks.close },
}));
vi.mock("@mantine/notifications", () => ({
  notifications: { show: mocks.notify },
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/components/general/AppPage", () => ({
  AppPage: ({
    children,
    withSearch,
  }: React.PropsWithChildren<{ withSearch: boolean }>) => (
    <div data-search={String(withSearch)}>{children}</div>
  ),
}));
vi.mock("@repo/ui", () => ({
  McpGuideScreen: ({
    openExternal,
  }: {
    openExternal: (url: string) => Promise<void>;
  }) => (
    <button onClick={() => void openExternal("https://chatgpt.com/plugins")}>
      guide
    </button>
  ),
}));
beforeEach(() => {
  vi.clearAllMocks();
  // Single-process test run: reset the pathname other files leave behind, since getTabAwareHref reads it.
  window.history.replaceState({}, "", "/");
  mocks.addListener.mockResolvedValue({ remove: mocks.remove });
  mocks.open.mockResolvedValue(undefined);
  mocks.close.mockResolvedValue(undefined);
});
afterEach(cleanup);
describe("native browser authorization boundary", () => {
  it("reopens the exact intercepted URL without tab navigation", async () => {
    const history = createMemoryHistory({
      initialEntries: ["/library/preferences"],
    });
    render(
      <Router history={history}>
        <AppUrlListener />
      </Router>,
    );
    const url =
      "https://gamenode.app/auth?sig=secret&resource=a&resource=b&ba_param=resource&ba_param=state";
    mocks.addListener.mock.calls[0][1]({ url });
    await waitFor(() => expect(mocks.open).toHaveBeenCalledWith({ url }));
    expect(history.location.pathname).toBe("/library/preferences");
    mocks.addListener.mock.calls[0][1]({
      url: "https://gamenode.app/oauth/consent?sig=secret",
    });
    expect(mocks.open).toHaveBeenLastCalledWith({
      url: "https://gamenode.app/oauth/consent?sig=secret",
    });
  });
  it("keeps ordinary content links and native sign-in callbacks", () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <AppUrlListener />
      </Router>,
    );
    const callback = mocks.addListener.mock.calls[0][1];
    callback({ url: "https://gamenode.app/game/12?x=1" });
    expect(history.location.pathname).toBe("/home/game/12");
    callback({ url: "app.gamenode://m/auth?error=failed" });
    expect(history.location.pathname).toBe("/m/auth");
    callback({ url: "app.gamenode://home?cookie=secret" });
    expect(mocks.open).not.toHaveBeenCalled();
    expect(history.location.pathname).toBe("/m/auth");
  });
  it("reports browser-launch failure without logging signed URLs", async () => {
    mocks.open.mockRejectedValue(new Error("launch failed"));
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <AppUrlListener />
      </Router>,
    );
    mocks.addListener.mock.calls[0][1]({
      url: "https://gamenode.app/oauth/consent?sig=secret",
    });
    await waitFor(() => expect(mocks.notify).toHaveBeenCalled());
    expect(JSON.stringify(mocks.notify.mock.calls)).not.toContain("secret");
  });
  it("mounts the public guide in every tab and keeps back history", async () => {
    for (const page of [
      "game",
      "profile/profile",
      "profile/stats",
      "profile/review_list",
      "feats",
      "auth",
      "importer/importer",
      "importer/source",
      "activity",
      "activity/detail",
      "posts.tsx",
      "blog",
      "blog/detail",
      "blog/archive.tsx",
      "collection_entry.tsx",
      "preferences.tsx",
      "search.tsx",
      "awards/vote.tsx",
      "awards/nominees.tsx",
      "library/library",
      "library/library_collections",
      "library/collection",
      "library/collection_reorder",
      "awards",
      "awards/result",
      "recap/recap_stats",
      "journal/journal_achievements",
      "journal/journal",
      "connection_callback",
    ])
      vi.doMock(`@/pages/${page}`, () => ({ default: () => null }));
    const { getCommonRoutes } = await import(
      "../../pages/routes/getCommonRoutes"
    );
    for (const tab of ["home", "explore", "library", "profile"]) {
      window.history.replaceState({}, "", `/${tab}/preferences`);
      const history = createMemoryHistory({
        initialEntries: [`/${tab}/preferences`, getTabAwareHref("/mcp")],
        initialIndex: 1,
      });
      const view = render(
        <Router history={history}>
          <Switch>{getCommonRoutes(`/${tab}`)}</Switch>
        </Router>,
      );
      fireEvent.click(screen.getByRole("button", { name: "guide" }));
      expect(mocks.open).toHaveBeenCalledWith({
        url: "https://chatgpt.com/plugins",
      });
      history.goBack();
      expect(history.location.pathname).toBe(`/${tab}/preferences`);
      view.unmount();
    }
  });
  it("uses the installed Browser adapter inside AppPage without search", async () => {
    const view = render(<McpPage />);
    fireEvent.click(screen.getByRole("button", { name: "guide" }));
    await waitFor(() => expect(mocks.open).toHaveBeenCalled());
    expect(view.container.querySelector('[data-search="false"]')).toBeTruthy();
  });
});
