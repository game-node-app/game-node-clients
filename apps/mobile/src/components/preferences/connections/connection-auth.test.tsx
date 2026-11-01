// @vitest-environment jsdom
import React, { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  ConnectionsService,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { ConnectionAuthCallback } from "../../../../../../packages/ui/src/components/connections/ConnectionAuthCallback";
import { PreferencesConnectionSetup } from "../../../../../../packages/ui/src/components/preferences/handlers/connections/PreferencesConnectionSetup";
import AppUrlListener from "../../general/AppUrlListener";

const mocks = vi.hoisted(() => ({
  own: {
    data: undefined as UserConnectionDto | undefined,
    error: null as Error | null,
    isLoading: false,
  },
  available: {
    data: [
      { type: "steam", authMode: "redirect", isImporterViable: true },
      { type: "xbox", authMode: "redirect", isImporterViable: true },
      { type: "psn", authMode: "public_identifier", isImporterViable: true },
      { type: "epicgames", authMode: "delegated_code", isImporterViable: true },
    ],
    error: null as Error | null,
    isLoading: false,
  },
  push: vi.fn(),
  showNotification: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  closeBrowser: vi.fn(),
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@mantine/notifications", () => ({
  notifications: { show: mocks.showNotification },
}));
vi.mock(
  "../../../../../../packages/ui/src/components/connections/hooks/useOwnUserConnectionByType",
  () => ({ useOwnUserConnectionByType: () => mocks.own }),
);
vi.mock(
  "../../../../../../packages/ui/src/components/connections/hooks/useAvailableConnections",
  () => ({ useAvailableConnections: () => mocks.available }),
);
vi.mock(
  "../../../../../../packages/ui/src/components/library/hooks/useUserLibrary",
  () => ({
    useUserLibrary: () => ({
      data: { collections: [{ id: "collection-id", name: "Backlog" }] },
    }),
  }),
);
vi.mock(
  "../../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-id" }),
);
vi.mock("../../../../../../packages/ui/src/util/index.ts", () => ({
  createErrorNotification: vi.fn(),
  getErrorMessage: (error: Error) => error.message,
}));
vi.mock("../../../../../../packages/ui/src/util/link", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@capacitor/app", () => ({ App: { addListener: mocks.addListener } }));
vi.mock("@capacitor/browser", () => ({
  Browser: { close: mocks.closeBrowser },
}));
vi.mock("react-router-dom", () => ({
  useHistory: () => ({ push: mocks.push }),
}));

function renderUI(children: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <MantineProvider>{children}</MantineProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
  return { invalidate };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.own.data = undefined;
  mocks.own.error = null;
  mocks.available.error = null;
  mocks.available.isLoading = false;
  mocks.push.mockResolvedValue(undefined);
  mocks.addListener.mockResolvedValue({ remove: mocks.removeListener });
  mocks.closeBrowser.mockResolvedValue(undefined);
  vi.spyOn(
    ConnectionsService,
    "connectionsControllerCreateOrUpdateV1",
  ).mockResolvedValue({});
  vi.spyOn(
    ConnectionsService,
    "connectionsControllerUpdateSettingsV1",
  ).mockResolvedValue({} as UserConnectionDto);
  vi.spyOn(
    ConnectionsService,
    "connectionsControllerInitRedirectAuthV1",
  ).mockResolvedValue({
    authorizationUrl: "https://provider.example/signin",
    state: "state",
  });
  vi.spyOn(
    ConnectionsService,
    "connectionsControllerCompleteRedirectAuthV1",
  ).mockResolvedValue({} as UserConnectionDto);
  window.history.replaceState({}, "", "/");
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("shared connection setup", () => {
  it.each([UserConnectionDto.type.STEAM, UserConnectionDto.type.XBOX])(
    "redirects %s without an identifier and includes import preferences",
    async (type) => {
      const redirect = vi.fn();
      const close = vi.fn();
      renderUI(
        <PreferencesConnectionSetup
          type={type}
          onRedirect={redirect}
          onClose={close}
        />,
      );
      expect(screen.queryByRole("textbox")).toBeNull();
      fireEvent.click(screen.getByRole("switch"));
      fireEvent.click(
        screen.getByRole("button", { name: "preferences.actions.connect" }),
      );
      await waitFor(() =>
        expect(redirect).toHaveBeenCalledWith(
          "https://provider.example/signin",
        ),
      );
      expect(
        ConnectionsService.connectionsControllerInitRedirectAuthV1,
      ).toHaveBeenCalledWith(type, {
        isAutoImportEnabled: true,
        autoImportCollectionId: undefined,
      });
      expect(
        ConnectionsService.connectionsControllerCreateOrUpdateV1,
      ).not.toHaveBeenCalled();
      expect(close).toHaveBeenCalledTimes(1);
    },
  );

  it("requires a PSN identifier and submits it without redirecting", async () => {
    renderUI(<PreferencesConnectionSetup type={UserConnectionDto.type.PSN} />);
    fireEvent.click(screen.getByRole("button", { name: "actions.submit" }));
    await screen.findByText("preferences.validation.usernameRequired");
    expect(
      ConnectionsService.connectionsControllerCreateOrUpdateV1,
    ).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  online-id  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "actions.submit" }));
    await waitFor(() =>
      expect(
        ConnectionsService.connectionsControllerCreateOrUpdateV1,
      ).toHaveBeenCalledWith({
        type: "psn",
        userIdentifier: "online-id",
        isAutoImportEnabled: false,
        autoImportCollectionId: undefined,
      }),
    );
    expect(
      ConnectionsService.connectionsControllerInitRedirectAuthV1,
    ).not.toHaveBeenCalled();
  });

  it("saves settings without authenticating and reconnects with existing preferences", async () => {
    mocks.own.data = {
      id: 7,
      sourceUsername: "Player",
      isAutoImportEnabled: true,
      autoImportCollectionId: "collection-id",
      authStatus: UserConnectionDto.authStatus.REAUTH_REQUIRED,
    } as UserConnectionDto;
    const redirect = vi.fn();
    const { invalidate } = renderUI(
      <PreferencesConnectionSetup
        type={UserConnectionDto.type.XBOX}
        onRedirect={redirect}
      />,
    );
    expect(
      screen.queryByRole("textbox", { name: "preferences.labels.gamertag" }),
    ).toBeNull();
    expect(
      screen.getByText("preferences.messages.reauthRequired"),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "actions.submit" }));
    await waitFor(() =>
      expect(
        ConnectionsService.connectionsControllerUpdateSettingsV1,
      ).toHaveBeenCalledWith(7, {
        isAutoImportEnabled: true,
        autoImportCollectionId: "collection-id",
      }),
    );
    expect(
      ConnectionsService.connectionsControllerInitRedirectAuthV1,
    ).not.toHaveBeenCalled();
    expect(
      ConnectionsService.connectionsControllerCreateOrUpdateV1,
    ).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["connections"] });
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "preferences.actions.reconnect",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "preferences.actions.reconnect" }),
    );
    await waitFor(() => expect(redirect).toHaveBeenCalled());
    expect(
      ConnectionsService.connectionsControllerInitRedirectAuthV1,
    ).toHaveBeenCalledWith("xbox", {
      isAutoImportEnabled: true,
      autoImportCollectionId: "collection-id",
    });
  });

  it("shows lookup failures instead of treating an existing account as missing", () => {
    mocks.own.error = new Error("Could not load connection");
    renderUI(
      <PreferencesConnectionSetup type={UserConnectionDto.type.STEAM} />,
    );
    expect(screen.getByText("Could not load connection")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("allows onboarding when the server returns 404 for a missing connection", () => {
    mocks.own.error = new ApiError(
      { method: "GET", url: "/v1/connections/own/steam" },
      { url: "", ok: false, status: 404, statusText: "Not Found", body: {} },
      "Not Found",
    );
    renderUI(
      <PreferencesConnectionSetup type={UserConnectionDto.type.STEAM} />,
    );
    expect(
      screen.getByRole("button", { name: "preferences.actions.connect" }),
    ).toBeTruthy();
  });
});

describe("delegated code connection setup", () => {
  const CODE = "0123456789abcdef0123456789abcdef";
  const complete = () =>
    ConnectionsService.connectionsControllerCompleteRedirectAuthV1;

  async function startFlow(redirect = vi.fn(), close = vi.fn()) {
    renderUI(
      <PreferencesConnectionSetup
        type={UserConnectionDto.type.EPICGAMES}
        onRedirect={redirect}
        onClose={close}
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(
      screen.getByRole("button", {
        name: "preferences.delegatedCode.continue",
      }),
    );
    const signIn = await screen.findByRole("button", {
      name: "preferences.delegatedCode.signInButton",
    });
    return { redirect, close, signIn };
  }

  async function openPasteStep(redirect = vi.fn(), close = vi.fn()) {
    const flow = await startFlow(redirect, close);
    fireEvent.click(flow.signIn);
    const input = await screen.findByRole("textbox");
    return { ...flow, input };
  }

  const submit = () =>
    fireEvent.click(screen.getByRole("button", { name: "actions.submit" }));

  it("inits once with the settings and opens the URL only on its own click", async () => {
    const { redirect, signIn } = await startFlow();
    expect(
      ConnectionsService.connectionsControllerInitRedirectAuthV1,
    ).toHaveBeenCalledTimes(1);
    expect(
      ConnectionsService.connectionsControllerInitRedirectAuthV1,
    ).toHaveBeenCalledWith("epicgames", {
      isAutoImportEnabled: true,
      autoImportCollectionId: undefined,
    });
    expect(redirect).not.toHaveBeenCalled();
    fireEvent.click(signIn);
    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith("https://provider.example/signin"),
    );
  });

  it.each([
    ["a raw code", ` ${CODE} `, CODE],
    [
      "the whole page",
      `{"authorizationCode":"${CODE}","sid":null}`,
      `{"authorizationCode":"${CODE}","sid":null}`,
    ],
  ])("sends %s as the trimmed callback code", async (_name, pasted, sent) => {
    const { close, input } = await openPasteStep();
    fireEvent.change(input, { target: { value: pasted } });
    submit();
    await waitFor(() =>
      expect(complete()).toHaveBeenCalledWith("epicgames", {
        state: "state",
        callbackParams: { code: sent },
      }),
    );
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  });

  it("sends nothing when the paste has no code", async () => {
    const { input } = await openPasteStep();
    fireEvent.change(input, { target: { value: '{"sid":null}' } });
    submit();
    await screen.findByText("preferences.delegatedCode.invalidCode");
    expect(complete()).not.toHaveBeenCalled();
  });

  it("locks the step after a rejected callback until the user starts over", async () => {
    vi.mocked(complete()).mockRejectedValue(new Error("State expired"));
    const { input } = await openPasteStep();
    fireEvent.change(input, { target: { value: CODE } });
    submit();
    await screen.findByText("State expired");
    expect((screen.getByRole("textbox") as HTMLInputElement).disabled).toBe(
      true,
    );
    expect(screen.queryByRole("button", { name: "actions.submit" })).toBeNull();
    expect(complete()).toHaveBeenCalledTimes(1);
    fireEvent.click(
      screen.getByRole("button", {
        name: "preferences.delegatedCode.startOver",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "preferences.delegatedCode.continue",
      }),
    );
    await waitFor(() =>
      expect(
        ConnectionsService.connectionsControllerInitRedirectAuthV1,
      ).toHaveBeenCalledTimes(2),
    );
  });

  it("starts the flow from Reconnect on a reauth_required connection", async () => {
    mocks.own.data = {
      id: 9,
      sourceUsername: "EpicPlayer",
      isAutoImportEnabled: false,
      autoImportCollectionId: null,
      authStatus: UserConnectionDto.authStatus.REAUTH_REQUIRED,
    } as UserConnectionDto;
    renderUI(
      <PreferencesConnectionSetup type={UserConnectionDto.type.EPICGAMES} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "preferences.actions.reconnect" }),
    );
    await screen.findByRole("button", {
      name: "preferences.delegatedCode.signInButton",
    });
    expect(
      ConnectionsService.connectionsControllerInitRedirectAuthV1,
    ).toHaveBeenCalledWith("epicgames", {
      isAutoImportEnabled: false,
      autoImportCollectionId: null,
    });
  });
});

describe("shared connection callback", () => {
  it.each([
    [
      "steam",
      {
        "openid.mode": "id_res",
        "openid.return_to":
          "https://gamenode.app/connections/callback/steam?state=state",
        "openid.sig": "signed+value",
      },
    ],
    ["xbox", { code: "authorization+code" }],
  ])(
    "completes %s once under StrictMode, preserving provider parameters",
    async (type, callbackParams) => {
      const query = new URLSearchParams({ state: "state", ...callbackParams });
      window.history.replaceState(
        {},
        "",
        `/connections/callback/${type}?${query}`,
      );
      const { invalidate } = renderUI(<ConnectionAuthCallback type={type} />);
      await waitFor(() =>
        expect(mocks.push).toHaveBeenCalledWith("/preferences/connections", {
          replace: true,
        }),
      );
      expect(
        ConnectionsService.connectionsControllerCompleteRedirectAuthV1,
      ).toHaveBeenCalledTimes(1);
      expect(
        ConnectionsService.connectionsControllerCompleteRedirectAuthV1,
      ).toHaveBeenCalledWith(type, { state: "state", callbackParams });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["connections"] });
    },
  );

  it.each([
    ["psn", "state=state", "connectionUnsupported"],
    ["xbox", "code=code", "connectionAuthInvalid"],
    ["xbox", "state=state", "connectionAuthInvalid"],
    ["xbox", "state=state&state=other&code=code", "connectionAuthInvalid"],
    ["xbox", "state=state&error=access_denied", "connectionAuthCancelled"],
    ["steam", "state=state&openid.mode=cancel", "connectionAuthCancelled"],
  ])(
    "rejects %s callback %s without making a request",
    async (type, query, error) => {
      window.history.replaceState(
        {},
        "",
        `/connections/callback/${type}?${query}`,
      );
      renderUI(<ConnectionAuthCallback type={type} />);
      await screen.findByText(`preferences.messages.${error}`);
      expect(
        ConnectionsService.connectionsControllerCompleteRedirectAuthV1,
      ).not.toHaveBeenCalled();
    },
  );

  it("shows callback failures without retrying single-use state", async () => {
    vi.mocked(
      ConnectionsService.connectionsControllerCompleteRedirectAuthV1,
    ).mockRejectedValue(new Error("State expired"));
    window.history.replaceState(
      {},
      "",
      "/connections/callback/xbox?state=state&code=code",
    );
    renderUI(<ConnectionAuthCallback type="xbox" />);
    await screen.findByText("State expired");
    expect(
      ConnectionsService.connectionsControllerCompleteRedirectAuthV1,
    ).toHaveBeenCalledTimes(1);
    fireEvent.click(
      screen.getByRole("button", {
        name: "preferences.actions.backToConnections",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/preferences/connections", {
      replace: true,
    });
  });
});

it("preserves embedded GameNode URLs in mobile Steam callback links", async () => {
  render(<AppUrlListener />);
  const listener = mocks.addListener.mock.calls[0]?.[1];
  const query = new URLSearchParams({
    state: "state",
    "openid.return_to":
      "https://gamenode.app/connections/callback/steam?state=state",
  });
  listener({ url: `https://gamenode.app/connections/callback/steam?${query}` });
  expect(mocks.push).toHaveBeenCalledWith(
    `/home/connections/callback/steam?${query}`,
  );
  expect(mocks.closeBrowser).toHaveBeenCalledTimes(1);
  cleanup();
  await waitFor(() => expect(mocks.removeListener).toHaveBeenCalled());
});
