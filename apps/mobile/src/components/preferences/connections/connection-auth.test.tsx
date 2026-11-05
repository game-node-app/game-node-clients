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
import {
  dehydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
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
      { type: "nintendo", authMode: "delegated_code", isImporterViable: true },
      { type: "gog", authMode: "delegated_code", isImporterViable: true },
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
  Link: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
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
  return { invalidate, client };
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

  it("saves and deletes GOG through existing APIs with visible ownership errors", async () => {
    mocks.own.data = {
      id: 17,
      type: "gog",
      sourceUsername: "GogPlayer",
      isAutoImportEnabled: true,
      autoImportCollectionId: "collection-id",
      authStatus: UserConnectionDto.authStatus.CONNECTED,
    } as UserConnectionDto;
    vi.mocked(
      ConnectionsService.connectionsControllerUpdateSettingsV1,
    ).mockRejectedValueOnce(new Error("Collection is not owned"));
    const deletion = vi
      .spyOn(ConnectionsService, "connectionsControllerDeleteV1")
      .mockRejectedValueOnce(new Error("Connection is not owned"))
      .mockResolvedValueOnce({});
    const close = vi.fn();
    const { invalidate } = renderUI(
      <PreferencesConnectionSetup
        type={UserConnectionDto.type.GOG}
        onClose={close}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "actions.submit" }));
    await screen.findByText("Collection is not owned");
    expect(
      ConnectionsService.connectionsControllerUpdateSettingsV1,
    ).toHaveBeenCalledWith(17, {
      isAutoImportEnabled: true,
      autoImportCollectionId: "collection-id",
    });
    fireEvent.click(screen.getByRole("button", { name: "actions.submit" }));
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["connections"] }),
    );
    fireEvent.click(screen.getByRole("button", { name: "actions.remove" }));
    await screen.findByText("Connection is not owned");
    expect(deletion).toHaveBeenCalledWith(17);
    fireEvent.click(screen.getByRole("button", { name: "actions.remove" }));
    await waitFor(() => expect(deletion).toHaveBeenCalledTimes(2));
    expect(
      ConnectionsService.connectionsControllerCreateOrUpdateV1,
    ).not.toHaveBeenCalled();
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

  async function startFlow(
    redirect = vi.fn(),
    close = vi.fn(),
    type = UserConnectionDto.type.EPICGAMES,
  ) {
    const { client, invalidate } = renderUI(
      <PreferencesConnectionSetup
        type={type}
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
    return { redirect, close, signIn, client, invalidate };
  }

  async function openPasteStep(
    redirect = vi.fn(),
    close = vi.fn(),
    type = UserConnectionDto.type.EPICGAMES,
  ) {
    const flow = await startFlow(redirect, close, type);
    fireEvent.click(flow.signIn);
    const input = await screen.findByRole(
      "textbox",
      type === UserConnectionDto.type.GOG
        ? { name: "preferences.delegatedCode.gog.pasteLabel" }
        : undefined,
    );
    return { ...flow, input };
  }

  const submit = () =>
    fireEvent.click(screen.getByRole("button", { name: "actions.submit" }));

  it("inits once with the settings and opens the URL only on its own click", async () => {
    const { redirect, signIn } = await startFlow();
    expect(
      screen.queryByRole("img", {
        name: "preferences.delegatedCode.nintendo.guideAlt",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("img", {
        name: "preferences.delegatedCode.gog.guideAlt",
      }),
    ).toBeNull();
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

  describe("gog", () => {
    const URL_TEXT =
      "https://embed.gog.com/on_login_success?origin=client&code=fake%2Bone%2Fuse&extra=a%20b";
    const openGog = () =>
      openPasteStep(vi.fn(), vi.fn(), UserConnectionDto.type.GOG);

    it("keeps sign-in selectable, protects the handoff and sends the full unchanged URL", async () => {
      const flow = await startFlow(
        vi.fn(),
        vi.fn(),
        UserConnectionDto.type.GOG,
      );
      const signInUrl = screen.getByRole("textbox", {
        name: "preferences.delegatedCode.gog.signInUrl",
      }) as HTMLInputElement;
      expect(signInUrl.value).toBe("https://provider.example/signin");
      expect(signInUrl.readOnly).toBe(true);
      expect(signInUrl.closest(".oauth-private.ph-no-capture")).toBeTruthy();
      expect(
        screen.getByText("preferences.delegatedCode.gog.coverage"),
      ).toBeTruthy();
      expect(
        ConnectionsService.connectionsControllerInitRedirectAuthV1,
      ).toHaveBeenCalledWith("gog", {
        isAutoImportEnabled: true,
        autoImportCollectionId: undefined,
      });
      fireEvent.click(flow.signIn);
      const input = await screen.findByRole("textbox", {
        name: "preferences.delegatedCode.gog.pasteLabel",
      });
      const fetch = vi.spyOn(window, "fetch");
      fireEvent.change(input, { target: { value: `  ${URL_TEXT}  ` } });
      submit();
      await waitFor(() =>
        expect(complete()).toHaveBeenCalledWith("gog", {
          state: "state",
          callbackParams: { code: URL_TEXT },
        }),
      );
      await waitFor(() => expect(flow.close).toHaveBeenCalledTimes(1));
      expect(flow.invalidate).toHaveBeenCalledWith({
        queryKey: ["connections"],
      });
      expect(fetch).not.toHaveBeenCalled();
      expect(
        ConnectionsService.connectionsControllerCreateOrUpdateV1,
      ).not.toHaveBeenCalled();
      expect(document.body.textContent).not.toContain("fake%2B");
    });

    it.each([
      "bare-code",
      "not a URL",
      "http://embed.gog.com/on_login_success?origin=client&code=x",
      "https://evil.example/on_login_success?origin=client&code=x",
      "https://embed.gog.com.evil.example/on_login_success?origin=client&code=x",
      "https://embed.gog.com/wrong?origin=client&code=x",
      "https://embed.gog.com/on_login_success?code=x",
      "https://embed.gog.com/on_login_success?origin=web&code=x",
      "https://embed.gog.com/on_login_success?origin=client&code=",
      "https://embed.gog.com/on_login_success?origin=client&code=%20",
      "https://embed.gog.com/on_login_success?origin=client",
      "https://user@embed.gog.com/on_login_success?origin=client&code=x",
      "https://embed.gog.com:444/on_login_success?origin=client&code=x",
    ])("rejects invalid input %s locally", async (value) => {
      const { input } = await openGog();
      fireEvent.change(input, { target: { value } });
      submit();
      expect(
        await screen.findByText("preferences.delegatedCode.gog.invalidLink"),
      ).toBeTruthy();
      expect(complete()).not.toHaveBeenCalled();
    });

    it.each(["expired", "rejected", "network failed"])(
      "requires fresh init after %s and never caches the sensitive error",
      async (reason) => {
        vi.mocked(complete()).mockRejectedValue(
          reason === "network failed"
            ? new TypeError(URL_TEXT)
            : new ApiError(
                {
                  method: "POST",
                  url: "/v1/connections/gog/auth/callback",
                  body: { callbackParams: { code: URL_TEXT } },
                },
                {
                  url: "",
                  ok: false,
                  status: 400,
                  statusText: reason,
                  body: { message: URL_TEXT },
                },
                URL_TEXT,
              ),
        );
        const log = vi.spyOn(console, "error");
        const { input, client } = await openGog();
        fireEvent.change(input, { target: { value: URL_TEXT } });
        submit();
        await screen.findByText("preferences.delegatedCode.gog.callbackFailed");
        expect(document.body.textContent).not.toContain("fake%2B");
        expect(JSON.stringify(log.mock.calls)).not.toContain("fake%2B");
        expect(
          JSON.stringify(
            dehydrate(client, { shouldDehydrateMutation: () => true }),
          ),
        ).not.toContain("fake%2B");
        expect(
          client.getMutationCache().getAll().at(-1)?.state.error?.message,
        ).toBe("preferences.delegatedCode.gog.callbackFailed");
        expect(complete()).toHaveBeenCalledTimes(1);
        expect(
          screen.queryByRole("button", { name: "actions.submit" }),
        ).toBeNull();
        vi.mocked(
          ConnectionsService.connectionsControllerInitRedirectAuthV1,
        ).mockResolvedValueOnce({
          state: "fresh-state",
          authorizationUrl: "https://provider.example/new-attempt",
        });
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
        vi.mocked(complete()).mockResolvedValueOnce({
          type: UserConnectionDto.type.GOG,
        } as UserConnectionDto);
        fireEvent.click(
          await screen.findByRole("button", {
            name: "preferences.delegatedCode.signInButton",
          }),
        );
        const freshInput = await screen.findByRole("textbox", {
          name: "preferences.delegatedCode.gog.pasteLabel",
        });
        fireEvent.change(freshInput, { target: { value: URL_TEXT } });
        submit();
        await waitFor(() =>
          expect(complete()).toHaveBeenLastCalledWith("gog", {
            state: "fresh-state",
            callbackParams: { code: URL_TEXT },
          }),
        );
      },
    );
  });

  it.each([UserConnectionDto.type.NINTENDO, UserConnectionDto.type.GOG])(
    "shows the %s guide before sign-in with play/pause controls and coverage",
    async (type) => {
      const redirect = vi.fn();
      const { signIn } = await startFlow(redirect, vi.fn(), type);
      expect(redirect).not.toHaveBeenCalled();
      expect(
        screen.getByText(`preferences.delegatedCode.${type}.coverage`),
      ).toBeTruthy();
      expect(
        screen
          .getByText(`preferences.delegatedCode.${type}.signInHint`)
          .compareDocumentPosition(signIn) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      const guide = screen.getByRole("img", {
        name: `preferences.delegatedCode.${type}.guideAlt`,
      });
      expect(guide.getAttribute("src")).toBe(`/img/${type}-link-guide.gif`);
      expect(
        guide.compareDocumentPosition(signIn) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        screen.queryByRole("img", {
          name: `preferences.delegatedCode.${type === "gog" ? "nintendo" : "gog"}.guideAlt`,
        }),
      ).toBeNull();
      fireEvent.click(
        screen.getByRole("button", {
          name: `preferences.delegatedCode.${type}.pauseGuide`,
          pressed: true,
        }),
      );
      expect(guide.getAttribute("src")).toBe(`/img/${type}-link-guide.png`);
      fireEvent.click(
        screen.getByRole("button", {
          name: `preferences.delegatedCode.${type}.playGuide`,
          pressed: false,
        }),
      );
      expect(guide.getAttribute("src")).toBe(`/img/${type}-link-guide.gif`);
      fireEvent.click(signIn);
      await waitFor(() =>
        expect(redirect).toHaveBeenCalledWith(
          "https://provider.example/signin",
        ),
      );
    },
  );

  it.each([UserConnectionDto.type.NINTENDO, UserConnectionDto.type.GOG])(
    "starts the %s guide still for reduced motion and allows explicit playback",
    async (type) => {
      vi.mocked(window.matchMedia).mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      await startFlow(vi.fn(), vi.fn(), type);
      const guide = screen.getByRole("img", {
        name: `preferences.delegatedCode.${type}.guideAlt`,
      });
      expect(guide.getAttribute("src")).toBe(`/img/${type}-link-guide.png`);
      fireEvent.click(
        screen.getByRole("button", {
          name: `preferences.delegatedCode.${type}.playGuide`,
          pressed: false,
        }),
      );
      expect(guide.getAttribute("src")).toBe(`/img/${type}-link-guide.gif`);
    },
  );

  describe("nintendo", () => {
    const LINK = "npf5c38e31cd085304b://auth#session_token_code=x&state=state";
    const openNintendo = (redirect = vi.fn()) =>
      openPasteStep(redirect, vi.fn(), UserConnectionDto.type.NINTENDO);

    it("sends the trimmed account link with the state", async () => {
      const { input } = await openNintendo();
      fireEvent.change(input, { target: { value: `  ${LINK}  ` } });
      submit();
      await waitFor(() =>
        expect(complete()).toHaveBeenCalledWith("nintendo", {
          state: "state",
          callbackParams: { code: LINK },
        }),
      );
    });

    it("sends nothing when the paste is not an account link", async () => {
      const { input } = await openNintendo();
      fireEvent.change(input, {
        target: { value: "https://accounts.nintendo.com/" },
      });
      submit();
      await screen.findByText("preferences.delegatedCode.nintendo.invalidLink");
      expect(complete()).not.toHaveBeenCalled();
    });

    it("sends nothing when the link is from another attempt", async () => {
      const { input } = await openNintendo();
      fireEvent.change(input, {
        target: { value: LINK.replace("state=state", "state=old") },
      });
      submit();
      await screen.findByText(
        "preferences.delegatedCode.nintendo.otherAttempt",
      );
      expect(complete()).not.toHaveBeenCalled();
    });
  });

  it.each([UserConnectionDto.type.EPICGAMES, UserConnectionDto.type.GOG])(
    "starts %s from Reconnect on a reauth_required connection",
    async (type) => {
      mocks.own.data = {
        id: 9,
        sourceUsername: "EpicPlayer",
        isAutoImportEnabled: false,
        autoImportCollectionId: null,
        authStatus: UserConnectionDto.authStatus.REAUTH_REQUIRED,
      } as UserConnectionDto;
      renderUI(<PreferencesConnectionSetup type={type} />);
      fireEvent.click(
        screen.getByRole("button", { name: "preferences.actions.reconnect" }),
      );
      await screen.findByRole("button", {
        name: "preferences.delegatedCode.signInButton",
      });
      expect(
        ConnectionsService.connectionsControllerInitRedirectAuthV1,
      ).toHaveBeenCalledWith(type, {
        isAutoImportEnabled: false,
        autoImportCollectionId: null,
      });
    },
  );
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
