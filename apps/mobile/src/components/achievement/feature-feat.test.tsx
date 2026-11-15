// @vitest-environment jsdom
import React from "react";
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
  AchievementsService,
  AchievementV2Dto,
  ObtainedAchievementDto,
} from "@repo/wrapper/server";
import { FeatFeaturedPicker } from "../../../../../packages/ui/src/components/achievement/feats/FeatFeaturedPicker";
import {
  FeaturedFeatOptimisticProvider,
  useFeatureFeat,
  useOptimisticFeaturedAchievementId,
} from "../../../../../packages/ui/src/components/achievement/hooks/useFeatureFeat";
import {
  buildFeatsModel,
  type FeatItem,
  type FeatProgress,
} from "../../../../../packages/ui/src/components/achievement/util/feats";
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

function ModalPresenter({ opened, title, children }: ModalComponentProps) {
  return opened ? (
    <div>
      {title && <h2>{title}</h2>}
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

const renderWithClient = (client: QueryClient, ui: React.ReactElement) =>
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
          {ui}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>,
  );

const tier = (level: number, threshold: number, expReward: number) => ({
  level,
  threshold,
  expReward,
  obtainedCount: 0,
  rarity: 0.1,
});

const feat = (
  id: string,
  name: string,
  overrides: Partial<AchievementV2Dto> = {},
): AchievementV2Dto => ({
  id,
  name,
  description: `${name} description`,
  category: 0,
  criteria: null,
  isHidden: false,
  metric: null,
  icon: null,
  event: null,
  startsAt: null,
  endsAt: null,
  tiers: [tier(1, 10, 10)],
  ...overrides,
});

const progress = (
  achievementId: string,
  overrides: Partial<FeatProgress> = {},
): FeatProgress => ({
  achievementId,
  value: 0,
  tier: 0,
  nextThreshold: null,
  ...overrides,
});

const obtained = (
  achievementId: string,
  isFeatured: boolean,
): ObtainedAchievementDto =>
  ({ achievementId, isFeatured }) as unknown as ObtainedAchievementDto;

const obtainedKey = (isFeatured?: boolean) => [
  "achievement",
  "obtained",
  "all",
  "user-1",
  { createdAt: "DESC" },
  isFeatured,
];

const allItems = (): FeatItem[] =>
  buildFeatsModel({
    achievements: [feat("alpha", "Alpha"), feat("beta", "Beta")],
    progress: [
      progress("alpha", { value: 10, tier: 1 }),
      progress("beta", { value: 10, tier: 1 }),
    ],
    now: Date.parse("2026-11-14T12:00:00Z"),
  }).items;

function FeatureHarness({ achievementId }: { achievementId: string }) {
  const mutation = useFeatureFeat("user-1");
  const pendingAchievementId = useOptimisticFeaturedAchievementId();
  return (
    <>
      <span data-testid={"pending-featured"}>
        {pendingAchievementId ?? "none"}
      </span>
      <button
        type={"button"}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(achievementId)}
      >
        Feature {achievementId}
      </button>
    </>
  );
}

const renderFeatureHarness = (client: QueryClient, achievementId: string) =>
  renderWithClient(
    client,
    <FeaturedFeatOptimisticProvider>
      <FeatureHarness achievementId={achievementId} />
    </FeaturedFeatOptimisticProvider>,
  );

const pendingFeatured = () =>
  screen.getByTestId("pending-featured").textContent;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useFeatureFeat", () => {
  it("sends a single id and keeps only the chosen feat in the featured cache", async () => {
    const serviceSpy = vi
      .spyOn(
        AchievementsService,
        "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
      )
      .mockResolvedValue({} as never);
    const client = createClient();
    const featuredKey = obtainedKey(true);
    client.setQueryData(featuredKey, [
      obtained("alpha", true),
      obtained("beta", true),
      obtained("gamma", true),
    ]);

    renderFeatureHarness(client, "gamma");
    fireEvent.click(screen.getByRole("button", { name: "Feature gamma" }));

    await waitFor(() => {
      expect(
        client.getQueryData<ObtainedAchievementDto[]>(featuredKey),
      ).toEqual([
        expect.objectContaining({ achievementId: "gamma", isFeatured: true }),
      ]);
    });
    expect(serviceSpy).toHaveBeenCalledWith({
      featuredAchievementIds: ["gamma"],
    });
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(pendingFeatured()).toBe("none"));
  });

  it("shows a first-time featured feat without inventing a filtered row", async () => {
    let resolveRequest: (() => void) | undefined;
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
    ).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }) as never,
    );

    const client = createClient();
    const featuredKey = obtainedKey(true);
    const unfilteredKey = obtainedKey();
    client.setQueryData(featuredKey, [obtained("alpha", true)]);
    client.setQueryData(unfilteredKey, [
      obtained("alpha", true),
      obtained("beta", false),
    ]);

    renderFeatureHarness(client, "beta");
    fireEvent.click(screen.getByRole("button", { name: "Feature beta" }));

    await waitFor(() => expect(pendingFeatured()).toBe("beta"));
    // "beta" is not part of the filtered cache and no ObtainedAchievementDto
    // is fabricated for it; the page reads the pending id instead.
    expect(client.getQueryData<ObtainedAchievementDto[]>(featuredKey)).toEqual(
      [],
    );
    expect(
      client.getQueryData<ObtainedAchievementDto[]>(unfilteredKey),
    ).toEqual([
      expect.objectContaining({ achievementId: "alpha", isFeatured: false }),
      expect.objectContaining({ achievementId: "beta", isFeatured: true }),
    ]);

    resolveRequest?.();
    await waitFor(() => expect(pendingFeatured()).toBe("none"));
    expect(
      (
        screen.getByRole("button", {
          name: "Feature beta",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  it("features the first feat when the featured cache is empty", async () => {
    let resolveRequest: (() => void) | undefined;
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
    ).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }) as never,
    );

    const client = createClient();
    const featuredKey = obtainedKey(true);
    client.setQueryData(featuredKey, []);

    renderFeatureHarness(client, "beta");
    fireEvent.click(screen.getByRole("button", { name: "Feature beta" }));

    await waitFor(() => expect(pendingFeatured()).toBe("beta"));
    expect(client.getQueryData<ObtainedAchievementDto[]>(featuredKey)).toEqual(
      [],
    );

    resolveRequest?.();
    await waitFor(() => expect(pendingFeatured()).toBe("none"));
  });

  it("keeps the filtered caches consistent with their own filters", async () => {
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
    ).mockResolvedValue({} as never);

    const client = createClient();
    const featuredKey = obtainedKey(true);
    const notFeaturedKey = obtainedKey(false);
    const unfilteredKey = obtainedKey();
    client.setQueryData(featuredKey, [
      obtained("alpha", true),
      obtained("beta", true),
    ]);
    client.setQueryData(notFeaturedKey, [
      obtained("gamma", false),
      obtained("delta", false),
    ]);
    client.setQueryData(unfilteredKey, [
      obtained("alpha", true),
      obtained("beta", false),
      obtained("gamma", false),
      obtained("delta", false),
    ]);

    renderFeatureHarness(client, "gamma");
    fireEvent.click(screen.getByRole("button", { name: "Feature gamma" }));

    await waitFor(() =>
      expect(
        client.getQueryData<ObtainedAchievementDto[]>(featuredKey),
      ).toEqual([]),
    );
    expect(
      client.getQueryData<ObtainedAchievementDto[]>(notFeaturedKey),
    ).toEqual([
      expect.objectContaining({ achievementId: "delta", isFeatured: false }),
    ]);
    expect(
      client.getQueryData<ObtainedAchievementDto[]>(unfilteredKey),
    ).toEqual([
      expect.objectContaining({ achievementId: "alpha", isFeatured: false }),
      expect.objectContaining({ achievementId: "beta", isFeatured: false }),
      expect.objectContaining({ achievementId: "gamma", isFeatured: true }),
      expect.objectContaining({ achievementId: "delta", isFeatured: false }),
    ]);

    await waitFor(() => expect(pendingFeatured()).toBe("none"));
  });

  it("restores the previous featured cache and notifies when the request fails", async () => {
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
    ).mockRejectedValue(new Error("Request failed"));

    const client = createClient();
    const featuredKey = obtainedKey(true);
    const snapshot = [obtained("alpha", true), obtained("beta", true)];
    client.setQueryData(featuredKey, snapshot);

    renderFeatureHarness(client, "alpha");
    fireEvent.click(screen.getByRole("button", { name: "Feature alpha" }));

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith({
        color: "red",
        message: "Request failed",
      });
    });
    expect(client.getQueryData<ObtainedAchievementDto[]>(featuredKey)).toEqual(
      snapshot,
    );
    await waitFor(() => expect(pendingFeatured()).toBe("none"));
  });
});

describe("FeatFeaturedPicker", () => {
  it("features one obtained feat and closes", async () => {
    const serviceSpy = vi
      .spyOn(
        AchievementsService,
        "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
      )
      .mockResolvedValue({} as never);
    const onClose = vi.fn();
    const client = createClient();

    renderWithClient(
      client,
      <FeatFeaturedPicker
        opened
        onClose={onClose}
        targetUserId={"user-1"}
        items={allItems()}
        featuredAchievementId={"alpha"}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Featured on your profile" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Beta/ }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(serviceSpy).toHaveBeenCalledWith({
      featuredAchievementIds: ["beta"],
    });
  });
});
