// @vitest-environment jsdom
import React, { useState } from "react";
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
import {
  AchievementsCodeService,
  AchievementsService,
  AchievementTierV2Dto,
  AchievementV2Dto,
  LevelService,
} from "@repo/wrapper/server";
import { useAchievementProgress } from "../../../../../packages/ui/src/components/achievement/hooks/useAchievementProgress";
import { useAllObtainedAchievements } from "../../../../../packages/ui/src/components/achievement/hooks/useAllObtainedAchievements";
import { RedeemFeatCodeModal } from "../../../../../packages/ui/src/components/achievement/feats/RedeemFeatCodeModal";
import { useUserLevel } from "../../../../../packages/ui/src/components/user-level/hooks/useUserLevel";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";

const notifications = vi.hoisted(() => ({ show: vi.fn() }));
vi.mock("@mantine/notifications", () => ({ notifications }));

const translate = (key: string, options?: Record<string, unknown>) => {
  const lookup = (path: string) => {
    let value: unknown = enTranslations;
    for (const part of path.split(".")) {
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }
    return value;
  };

  let value = lookup(key);
  if (typeof value !== "string") {
    const count = Number(options?.count ?? 0);
    value = lookup(`${key}_${count === 1 ? "one" : "other"}`);
  }

  return typeof value === "string"
    ? value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(options?.[name] ?? ""),
      )
    : key;
};

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));

function ModalPresenter({
  opened,
  title,
  children,
  onClose,
}: ModalComponentProps) {
  return opened ? (
    <div>
      {title && <h2>{title}</h2>}
      <button type="button" onClick={onClose}>
        close modal
      </button>
      {children}
    </div>
  ) : null;
}

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const catalogKey = ["achievements", "v2", "user-1"];

const renderRedeemModal = (
  client: QueryClient,
  onClose = vi.fn(),
  extra?: React.ReactNode,
) =>
  render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <UIProvider
          presenters={{ Modal: ModalPresenter }}
          hooks={{
            useRouter: () => ({
              back: () => {},
              pathname: "/feats/user-1",
              push: async () => {},
              query: new URLSearchParams(),
            }),
          }}
        >
          {extra}
          <RedeemFeatCodeModal
            opened
            onClose={onClose}
            targetUserId={"user-1"}
          />
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>,
  );

const renderRedeemHarness = (
  client: QueryClient,
  onClose = vi.fn(),
  extra?: React.ReactNode,
) => {
  function Harness() {
    const [opened, setOpened] = useState(true);

    return (
      <>
        {extra}
        <button type="button" onClick={() => setOpened(true)}>
          reopen modal
        </button>
        <button type="button" onClick={() => setOpened(false)}>
          hide modal
        </button>
        <RedeemFeatCodeModal
          opened={opened}
          onClose={() => {
            onClose();
            setOpened(false);
          }}
          targetUserId={"user-1"}
        />
      </>
    );
  }

  return render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <UIProvider
          presenters={{ Modal: ModalPresenter }}
          hooks={{
            useRouter: () => ({
              back: () => {},
              pathname: "/feats/user-1",
              push: async () => {},
              query: new URLSearchParams(),
            }),
          }}
        >
          <Harness />
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>,
  );
};

const tier = (level: number, expReward: number): AchievementTierV2Dto => ({
  level,
  threshold: level * 10,
  expReward,
  obtainedCount: 0,
  rarity: 0.1,
});

const testLab: AchievementV2Dto = {
  id: "test-lab",
  name: "Test Lab",
  description: "Unlock a hidden test feat.",
  category: 4,
  criteria: null,
  isHidden: false,
  metric: "manual",
  icon: null,
  event: null,
  startsAt: null,
  endsAt: null,
  tiers: [tier(1, 100)],
};

const otherFeat: AchievementV2Dto = {
  ...testLab,
  id: "other",
  name: "Other feat",
};

const paginatedCatalog = (data: AchievementV2Dto[]) => ({
  data,
  pagination: { totalItems: data.length, totalPages: 1, hasNextPage: false },
});

const fillAndSubmit = (code: string) => {
  fireEvent.change(screen.getByPlaceholderText("Enter the code"), {
    target: { value: code },
  });
  fireEvent.click(screen.getByRole("button", { name: "Redeem" }));
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RedeemFeatCodeModal", () => {
  it("disables Redeem while the field is empty, shows the unlocked feat and refreshes the page data", async () => {
    const consumeSpy = vi
      .spyOn(AchievementsCodeService, "achievementsCodeControllerConsumeV1")
      .mockResolvedValue({ achievementId: "test-lab", tier: 1 } as never);
    const catalogSpy = vi
      .spyOn(AchievementsService, "achievementsV2ControllerGetAchievementsV2")
      .mockResolvedValue(paginatedCatalog([testLab]) as never);
    const progressSpy = vi
      .spyOn(AchievementsService, "achievementsV2ControllerGetProgressV2")
      .mockResolvedValue([] as never);
    const obtainedSpy = vi
      .spyOn(
        AchievementsService,
        "achievementsControllerGetAllObtainedAchievementsV1",
      )
      .mockResolvedValue([] as never);
    const levelSpy = vi
      .spyOn(LevelService, "levelControllerFindOneV1")
      .mockResolvedValue({} as never);

    const client = createClient();
    client.setQueryData(catalogKey, [testLab]);

    function DataHarness() {
      useAchievementProgress("user-1");
      useUserLevel("user-1");
      useAllObtainedAchievements("user-1", true);
      return null;
    }

    renderRedeemModal(client, vi.fn(), <DataHarness />);

    await waitFor(() => {
      expect(progressSpy).toHaveBeenCalledTimes(1);
      expect(obtainedSpy).toHaveBeenCalledTimes(1);
      expect(levelSpy).toHaveBeenCalledTimes(1);
    });

    expect(
      (screen.getByRole("button", { name: "Redeem" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    fillAndSubmit("GN-7KQ2");

    await screen.findByRole("heading", { name: "New feat" });
    expect(screen.getByText("Test Lab")).toBeTruthy();
    expect(screen.getByText("+100 XP")).toBeTruthy();
    expect(consumeSpy).toHaveBeenCalledWith("GN-7KQ2");
    expect(notifications.show).toHaveBeenCalledWith({
      color: "green",
      message: "Successfully redeemed your code. Enjoy!",
    });

    await waitFor(() => {
      expect(catalogSpy).toHaveBeenCalledTimes(1);
      expect(progressSpy).toHaveBeenCalledTimes(2);
      expect(obtainedSpy).toHaveBeenCalledTimes(2);
      expect(levelSpy).toHaveBeenCalledTimes(2);
    });
  });

  it("waits for the refreshed catalog before revealing the feat", async () => {
    vi.spyOn(
      AchievementsCodeService,
      "achievementsCodeControllerConsumeV1",
    ).mockResolvedValue({ achievementId: "test-lab", tier: 1 } as never);
    const catalogRequest = deferred<never>();
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetAchievementsV2",
    ).mockReturnValue(catalogRequest.promise as never);

    const client = createClient();
    client.setQueryData(catalogKey, [otherFeat]);

    renderRedeemModal(client);
    fillAndSubmit("TEST-LAB");

    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ color: "green" }),
      ),
    );
    expect(screen.queryByRole("heading", { name: "New feat" })).toBeNull();
    expect(
      (screen.getByRole("button", { name: "Redeem" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    catalogRequest.resolve(paginatedCatalog([testLab]) as never);

    await screen.findByRole("heading", { name: "New feat" });
    expect(screen.getByText("Test Lab")).toBeTruthy();
  });

  it("keeps the dialog open with the server error under the field", async () => {
    vi.spyOn(
      AchievementsCodeService,
      "achievementsCodeControllerConsumeV1",
    ).mockRejectedValue(new Error("Code has expired."));

    const client = createClient();
    client.setQueryData(catalogKey, [testLab]);

    renderRedeemModal(client);
    fillAndSubmit("EXPIRED");

    await screen.findByText("Code has expired.");
    expect(
      screen.getByRole("heading", { name: "Redeem achievement with a code" }),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "New feat" })).toBeNull();
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it("closes without the reveal when the refreshed catalog has no such feat", async () => {
    vi.spyOn(
      AchievementsCodeService,
      "achievementsCodeControllerConsumeV1",
    ).mockResolvedValue({ achievementId: "ghost-feat", tier: 1 } as never);
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetAchievementsV2",
    ).mockResolvedValue(paginatedCatalog([otherFeat]) as never);

    const onClose = vi.fn();
    const client = createClient();
    client.setQueryData(catalogKey, [testLab]);

    renderRedeemModal(client, onClose);
    fillAndSubmit("GHOST");

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("heading", { name: "New feat" })).toBeNull();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "green" }),
    );
  });

  it("closes after the success notification when an older server returns no body", async () => {
    vi.spyOn(
      AchievementsCodeService,
      "achievementsCodeControllerConsumeV1",
    ).mockResolvedValue(undefined as never);
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetAchievementsV2",
    ).mockResolvedValue(paginatedCatalog([testLab]) as never);

    const onClose = vi.fn();
    const client = createClient();
    client.setQueryData(catalogKey, [testLab]);

    renderRedeemModal(client, onClose);
    fillAndSubmit("OLD-SERVER");

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("heading", { name: "New feat" })).toBeNull();
    expect(notifications.show).toHaveBeenCalledWith({
      color: "green",
      message: "Successfully redeemed your code. Enjoy!",
    });
  });

  it.each([
    ["a reveal", { achievementId: "test-lab", tier: 1 }],
    ["no body", undefined],
    [
      "a feat missing from the catalog",
      { achievementId: "ghost-feat", tier: 1 },
    ],
  ])(
    "ignores a delayed response (%s) from a closed opening",
    async (_name, response) => {
      const request = deferred<unknown>();
      vi.spyOn(
        AchievementsCodeService,
        "achievementsCodeControllerConsumeV1",
      ).mockReturnValue(request.promise as never);
      const catalogSpy = vi
        .spyOn(AchievementsService, "achievementsV2ControllerGetAchievementsV2")
        .mockResolvedValue(paginatedCatalog([testLab]) as never);

      const onClose = vi.fn();
      const client = createClient();
      renderRedeemHarness(client, onClose);

      fillAndSubmit("GN-7KQ2");
      await waitFor(() =>
        expect(
          AchievementsCodeService.achievementsCodeControllerConsumeV1,
        ).toHaveBeenCalledWith("GN-7KQ2"),
      );

      // Close from the modal header/overlay, then reopen before the response.
      fireEvent.click(screen.getByRole("button", { name: "close modal" }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByPlaceholderText("Enter the code")).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "reopen modal" }));
      const input = screen.getByPlaceholderText(
        "Enter the code",
      ) as HTMLInputElement;
      expect(input.value).toBe("");

      request.resolve(response);

      await waitFor(() =>
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({ color: "green" }),
        ),
      );
      // The mutation still refreshes the page for the stale response.
      await waitFor(() => expect(catalogSpy).toHaveBeenCalledTimes(2));
      expect(screen.queryByRole("heading", { name: "New feat" })).toBeNull();
      expect(
        screen.getByRole("heading", {
          name: "Redeem achievement with a code",
        }),
      ).toBeTruthy();
      // The stale response must not close the new opening.
      expect(onClose).toHaveBeenCalledTimes(1);
    },
  );

  it("resets the opening when the parent closes it through the opened prop", async () => {
    const request = deferred<unknown>();
    vi.spyOn(
      AchievementsCodeService,
      "achievementsCodeControllerConsumeV1",
    ).mockReturnValue(request.promise as never);
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetAchievementsV2",
    ).mockResolvedValue(paginatedCatalog([testLab]) as never);

    const onClose = vi.fn();
    const client = createClient();
    renderRedeemHarness(client, onClose);

    fillAndSubmit("GN-7KQ2");
    await waitFor(() =>
      expect(
        AchievementsCodeService.achievementsCodeControllerConsumeV1,
      ).toHaveBeenCalledWith("GN-7KQ2"),
    );

    // Parent-controlled close: the modal's onClose is never called.
    fireEvent.click(screen.getByRole("button", { name: "hide modal" }));
    expect(screen.queryByPlaceholderText("Enter the code")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "reopen modal" }));
    expect(
      (screen.getByPlaceholderText("Enter the code") as HTMLInputElement).value,
    ).toBe("");

    request.resolve({ achievementId: "test-lab", tier: 1 });

    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ color: "green" }),
      ),
    );
    expect(screen.queryByRole("heading", { name: "New feat" })).toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Redeem achievement with a code",
      }),
    ).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("features the unlocked feat from the reveal step", async () => {
    vi.spyOn(
      AchievementsCodeService,
      "achievementsCodeControllerConsumeV1",
    ).mockResolvedValue({ achievementId: "test-lab", tier: 1 } as never);
    const catalogSpy = vi
      .spyOn(AchievementsService, "achievementsV2ControllerGetAchievementsV2")
      .mockResolvedValue(paginatedCatalog([testLab]) as never);
    const featureSpy = vi
      .spyOn(
        AchievementsService,
        "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
      )
      .mockResolvedValue({} as never);
    const onClose = vi.fn();

    const client = createClient();
    client.setQueryData(catalogKey, [testLab]);

    renderRedeemModal(client, onClose);
    fillAndSubmit("TEST-LAB");
    await screen.findByRole("heading", { name: "New feat" });

    fireEvent.click(screen.getByRole("button", { name: "Feature on profile" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(featureSpy).toHaveBeenCalledWith({
      featuredAchievementIds: ["test-lab"],
    });
    expect(catalogSpy).toHaveBeenCalled();
  });
});
