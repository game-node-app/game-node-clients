// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { setupDom } from "@/components/mcp/testUtils";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsModal } from "../../../../../packages/ui/src/components/settings/SettingsModal";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";

const mocks = vi.hoisted(() => ({
  session: { data: null as unknown, isPending: false },
  push: vi.fn(async (_url: string, _options?: unknown) => {}),
  onMobile: false,
  authPath: "/auth",
  asPath: "/home",
  query: "",
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/general/hooks/useOnMobile",
  () => ({ useOnMobile: () => mocks.onMobile }),
);

vi.mock(
  "../../../../../packages/ui/src/components/settings/SettingsSidebar",
  () => ({ SettingsSidebar: () => <div data-testid="settings-sidebar" /> }),
);

vi.mock(
  "../../../../../packages/ui/src/components/settings/SettingsPanel",
  () => ({
    SettingsPanel: ({ children }: PropsWithChildren) => (
      <div data-testid="settings-panel">{children}</div>
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/settings/SettingsTabContent",
  () => ({
    SettingsTabContent: () => <div data-testid="settings-tab-content" />,
  }),
);

function ModalPresenter({ opened, children }: ModalComponentProps) {
  return opened ? <div data-testid="settings-modal">{children}</div> : null;
}

function renderSettingsModal() {
  const query = new URLSearchParams(mocks.query);

  return render(
    <MantineProvider>
      <UIProvider
        hooks={{
          authPath: mocks.authPath,
          useRouter: () => ({
            pathname: mocks.asPath.split("?")[0],
            asPath: mocks.asPath,
            back: vi.fn(),
            push: mocks.push,
            query,
          }),
        }}
        presenters={{ Modal: ModalPresenter }}
      >
        <SettingsModal />
      </UIProvider>
    </MantineProvider>,
  );
}

function signedIn() {
  mocks.session = { data: { user: { id: "user-1" } }, isPending: false };
}

function signedOut() {
  mocks.session = { data: null, isPending: false };
}

function homepageWith(settingsQuery: string) {
  mocks.query = settingsQuery;
  mocks.asPath = settingsQuery ? `/home?${settingsQuery}` : "/home";
}

beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  mocks.onMobile = false;
  mocks.authPath = "/auth";
  mocks.query = "";
  mocks.asPath = "/home";
  signedOut();
});

afterEach(cleanup);

describe("SettingsModal authentication", () => {
  it("redirects a signed-out visitor once, returning to the full settings URL", async () => {
    homepageWith("settings=premium&interval=monthly");

    renderSettingsModal();

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    expect(mocks.push).toHaveBeenCalledWith(
      `/auth?redirectTo=${encodeURIComponent(
        "/home?settings=premium&interval=monthly",
      )}`,
      { absolute: true },
    );
    expect(screen.queryByTestId("settings-modal")).toBeNull();

    // The redirect is guarded: it must not run again on later renders.
    expect(mocks.push).toHaveBeenCalledTimes(1);
  });

  it("does not redirect when there is no settings parameter", async () => {
    homepageWith("");

    renderSettingsModal();

    await waitFor(() =>
      expect(screen.queryByTestId("settings-modal")).toBeNull(),
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("does not redirect from the sign-in page itself", async () => {
    mocks.query = "settings=premium";
    mocks.asPath =
      "/auth?redirectTo=" + encodeURIComponent("/home?settings=premium");

    renderSettingsModal();

    await waitFor(() => expect(mocks.push).not.toHaveBeenCalled());
    expect(screen.queryByTestId("settings-modal")).toBeNull();
  });

  it("renders the modal for a signed-in visitor", () => {
    signedIn();
    homepageWith("settings=profile");

    renderSettingsModal();

    expect(screen.getByTestId("settings-modal")).toBeTruthy();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});

describe("SettingsModal mobile initial view", () => {
  beforeEach(signedIn);

  it("opens the Supporter panel directly on a checkout return", () => {
    mocks.onMobile = true;
    homepageWith("settings=premium&checkout=success");

    renderSettingsModal();

    expect(screen.getByTestId("settings-panel")).toBeTruthy();
    expect(screen.getByTestId("settings-tab-content")).toBeTruthy();
    expect(screen.queryByTestId("settings-sidebar")).toBeNull();
  });

  it("still lands on the tab list without a checkout result", () => {
    mocks.onMobile = true;
    homepageWith("settings=premium");

    renderSettingsModal();

    expect(screen.getByTestId("settings-sidebar")).toBeTruthy();
    expect(screen.queryByTestId("settings-panel")).toBeNull();
  });

  it("shows both screens side by side on desktop", () => {
    mocks.onMobile = false;
    homepageWith("settings=premium&checkout=cancel");

    renderSettingsModal();

    expect(screen.getByTestId("settings-sidebar")).toBeTruthy();
    expect(screen.getByTestId("settings-panel")).toBeTruthy();
  });
});
