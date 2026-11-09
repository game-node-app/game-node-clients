// @vitest-environment jsdom
import { setupDom } from "@/components/mcp/testUtils";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileResponseDto, ProfileService } from "@repo/wrapper/server";
import { UIProvider } from "../../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../../packages/ui/src/util/modal";
import PreferencesCustomCoversItems from "./PreferencesCustomCoversItems";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mocks = vi.hoisted(() => ({
  session: {
    data: null as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

const VIEWER_ID = "viewer";

const LABELS = {
  item: "settings.appearance.customCovers.title",
  any: "settings.appearance.customCovers.any.label",
  preferYours: "settings.appearance.customCovers.prefer_yours.label",
  none: "settings.appearance.customCovers.none.label",
} as const;

function ModalPresenter({ opened, title, children }: ModalComponentProps) {
  return opened ? (
    <div data-testid="covers-modal">
      <h1>{title}</h1>
      {children}
    </div>
  ) : null;
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
}

function renderItems(client: QueryClient) {
  return render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <UIProvider
          hooks={{
            useRouter: () => ({
              pathname: "/",
              query: new URLSearchParams(),
              back: vi.fn(),
              push: vi.fn(async () => {}),
            }),
          }}
          presenters={{ Modal: ModalPresenter }}
        >
          <PreferencesCustomCoversItems />
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>,
  );
}

const profile = (customCoverMode?: string) =>
  ({ customCoverMode }) as unknown as ProfileResponseDto;

function radio(name: string) {
  return screen.getByRole("radio", { name: new RegExp(name) });
}

function isChecked(name: string) {
  return radio(name).getAttribute("aria-checked") === "true";
}

async function openModal(container: HTMLElement) {
  fireEvent.click(container.querySelector("ion-item")!);
  await waitFor(() => expect(screen.getByTestId("covers-modal")).toBeTruthy());
}

beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  mocks.session = { data: { user: { id: VIEWER_ID } }, isPending: false };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mocks.session = { data: null, isPending: false };
});

describe("PreferencesCustomCoversItems", () => {
  it("shows the entry and opens the modal with the current mode selected", async () => {
    const profileSpy = vi
      .spyOn(ProfileService, "profileControllerFindOneByIdV1")
      .mockResolvedValue(profile("prefer_yours"));

    const { container } = renderItems(createClient());

    expect(screen.getByText(LABELS.item)).toBeTruthy();
    expect(screen.queryByTestId("covers-modal")).toBeNull();

    await openModal(container);

    await waitFor(() => expect(profileSpy).toHaveBeenCalledWith(VIEWER_ID));
    await waitFor(() => expect(isChecked(LABELS.preferYours)).toBe(true));
    expect(isChecked(LABELS.any)).toBe(false);
    expect(isChecked(LABELS.none)).toBe(false);
  });

  it("saves a mode change through profileControllerUpdateV1", async () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("prefer_yours"));
    const updateSpy = vi
      .spyOn(ProfileService, "profileControllerUpdateV1")
      .mockResolvedValue(undefined as never);

    const { container } = renderItems(createClient());

    await openModal(container);
    await waitFor(() => expect(isChecked(LABELS.preferYours)).toBe(true));

    fireEvent.click(radio(LABELS.none));

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({ customCoverMode: "none" }),
    );
  });
});
