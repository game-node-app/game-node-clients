// @vitest-environment jsdom
import React, { useState } from "react";
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
  AchievementsService,
  AchievementEventDto,
  AchievementIconDto,
  AchievementTierV2Dto,
  AchievementV2Dto,
  ObtainedAchievementDto,
} from "../../../../../packages/wrapper/src/server";
import { AchievementsScreen } from "../../../../../packages/ui/src/components/achievement/AchievementsScreen";
import type { FeatProgress } from "../../../../../packages/ui/src/components/achievement/util/feats";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import ptBR from "../../../../../packages/locales/src/translations/json/pt-BR.json";

const mocks = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
  profile: undefined as Record<string, unknown> | undefined,
  level: undefined as Record<string, unknown> | undefined,
}));

function translate(key: string, options?: Record<string, unknown>): string {
  const lookup = (path: string): unknown => {
    let value: unknown = ptBR;
    for (const part of path.split(".")) {
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }
    return value;
  };

  let value = lookup(key);
  if (typeof value !== "string" && options?.count !== undefined) {
    value = lookup(`${key}_${options.count === 1 ? "one" : "other"}`);
  }
  if (typeof value !== "string") return key;

  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    String(options?.[name] ?? ""),
  );
}

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "pt-BR", resolvedLanguage: "pt-BR" },
  }),
  useI18nContext: () => ({
    language: "pt-BR",
    resolvedLanguage: "pt-BR",
    setLanguage: () => {},
    supportedLanguages: ["en", "pt-BR"],
  }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({
    useUserId: () => mocks.userId,
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({ data: mocks.profile }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/user-level/hooks/useUserLevel",
  () => ({
    useUserLevel: () => ({ data: mocks.level }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/general/avatar/UserAvatar",
  () => ({
    UserAvatar: ({ userId }: { userId?: string }) => (
      <div data-testid={"user-avatar"} data-user-id={userId} />
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/general/hooks/useOnMobile",
  () => ({ useOnMobile: () => false }),
);

function ModalPresenter({ opened, title, children }: ModalComponentProps) {
  return opened ? (
    <div>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ) : null;
}

function Providers({
  children,
  client: providedClient,
}: {
  children: React.ReactNode;
  client?: QueryClient;
}) {
  const [client] = useState(
    () =>
      providedClient ??
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <MantineProvider>
      <QueryClientProvider client={client}>
        <UIProvider
          presenters={{
            Modal: ModalPresenter,
            Link: ({ href, children: linkChildren, ...others }) => (
              <a href={href} {...others}>
                {linkChildren}
              </a>
            ),
          }}
          hooks={{
            useRouter: () => ({
              back: () => {},
              pathname: "/feats/user-1",
              push: async () => {},
              query: new URLSearchParams(),
            }),
          }}
        >
          {children}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

const renderScreen = (ui: React.ReactElement) =>
  render(ui, { wrapper: Providers });

const renderScreenWithClient = (ui: React.ReactElement, client: QueryClient) =>
  render(ui, {
    wrapper: ({ children }) => (
      <Providers client={client}>{children}</Providers>
    ),
  });

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const tier = (
  level: number,
  threshold: number,
  expReward: number,
): AchievementTierV2Dto => ({
  level,
  threshold,
  expReward,
  obtainedCount: 0,
  rarity: 0.1,
});

const feat = (
  id: string,
  overrides: Partial<AchievementV2Dto> = {},
): AchievementV2Dto => ({
  id,
  name: id,
  description: `${id} description`,
  category: 0 as AchievementV2Dto["category"],
  criteria: null,
  isHidden: false,
  metric: null,
  icon: { kind: AchievementIconDto.kind.GLYPH, name: "star" },
  event: null,
  startsAt: null,
  endsAt: null,
  tiers: [tier(1, 10, 10)],
  ...overrides,
});

const event = (
  id: string,
  name: string,
  startsAt: string,
  endsAt: string,
): AchievementEventDto => ({
  id,
  slug: id,
  name,
  description: `${name} description`,
  startsAt,
  endsAt,
});

const progress = (
  achievementId: string,
  overrides: Partial<FeatProgress> = {},
): FeatProgress => ({
  achievementId,
  value: 0,
  tier: 0,
  nextThreshold: null,
  obtainedTiers: [],
  ...overrides,
});

const backlogDragon = feat("backlog-dragon", {
  name: "Backlog Dragon",
  description: "Acumule jogos na sua biblioteca.",
  tiers: [tier(1, 10, 10), tier(2, 25, 25), tier(3, 50, 50), tier(4, 100, 100)],
});

const testLab = feat("test-lab", {
  name: "Test Lab",
  description: "Sala de testes do GameNode.",
  tiers: [tier(1, 10, 40)],
});

const buildCatalog = (extra: AchievementV2Dto[] = []) => [
  backlogDragon,
  testLab,
  ...Array.from({ length: 22 }, (_, index) =>
    feat(`locked-${index}`, { name: `Bloqueado ${index}` }),
  ),
  ...extra,
];

const featured = (achievementId: string): ObtainedAchievementDto =>
  ({ achievementId, isFeatured: true }) as ObtainedAchievementDto;

const obtainedKey = (isFeatured?: boolean) => [
  "achievement",
  "obtained",
  "all",
  "user-1",
  { createdAt: "DESC" },
  isFeatured,
];

const paginated = (data: AchievementV2Dto[]) => ({
  data,
  pagination: { totalItems: data.length, totalPages: 1, hasNextPage: false },
});

const mockServices = ({
  catalog = buildCatalog(),
  progressList = [
    progress("backlog-dragon", {
      value: 60,
      tier: 3,
      nextThreshold: 100,
      obtainedTiers: [
        { level: 1, obtainedAt: "2025-11-03T12:00:00" },
        { level: 2, obtainedAt: "2025-12-19T12:00:00" },
        { level: 3, obtainedAt: "2026-09-08T12:00:00" },
      ],
    }),
    progress("test-lab", { value: 10, tier: 1 }),
  ],
  featuredList = [featured("backlog-dragon")],
}: {
  catalog?: AchievementV2Dto[];
  progressList?: FeatProgress[];
  featuredList?: ObtainedAchievementDto[];
} = {}) => {
  vi.spyOn(
    AchievementsService,
    "achievementsV2ControllerGetAchievementsV2",
  ).mockResolvedValue(paginated(catalog) as never);
  vi.spyOn(
    AchievementsService,
    "achievementsV2ControllerGetProgressV2",
  ).mockResolvedValue(progressList as never);
  vi.spyOn(
    AchievementsService,
    "achievementsControllerGetAllObtainedAchievementsV1",
  ).mockResolvedValue(featuredList as never);
};

beforeEach(() => {
  mocks.userId = "user-1";
  mocks.profile = {
    username: "ThePrado",
    createdAt: "2025-11-02T12:00:00.000Z",
  };
  mocks.level = {
    currentLevel: 14,
    currentLevelExp: 2340,
    levelUpExpCost: 2800,
  };
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
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

describe("FeatsScreen", () => {
  it("renders the summary, the sections and opens the tier details", async () => {
    mockServices();

    renderScreen(<AchievementsScreen targetUserId={"user-1"} />);

    expect(await screen.findByText("Feitos obtidos")).toBeTruthy();
    expect(screen.getByText("XP vindo de feitos")).toBeTruthy();
    expect(screen.getByText("125")).toBeTruthy();
    expect(screen.getByText("Backlog Dragon · Nível 3")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Obtidas" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Ainda não obtidas" }),
    ).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "Resgatar um código" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Trocar" })).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Níveis" })[0]);

    expect(await screen.findByText("Rumo ao nível 4")).toBeTruthy();
    expect(screen.getByText("Obtido em 03/11/2025")).toBeTruthy();
  });

  it("does not show the redeem or featured actions to a visitor", async () => {
    mocks.userId = "visitor";
    mockServices({ featuredList: [] });

    renderScreen(<AchievementsScreen targetUserId={"user-1"} />);

    expect(await screen.findByText("Feitos obtidos")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Resgatar um código" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Trocar" })).toBeNull();
    expect(screen.queryByText("Nenhum feito em destaque")).toBeNull();
  });

  it("shows the chosen feat in the featured slot before the request resolves", async () => {
    const updateRequest = deferred<void>();
    const updateSpy = vi
      .spyOn(
        AchievementsService,
        "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
      )
      .mockReturnValue(updateRequest.promise as never);

    const catalog = buildCatalog();
    const progressList = [
      progress("backlog-dragon", {
        value: 60,
        tier: 3,
        nextThreshold: 100,
        obtainedTiers: [
          { level: 1, obtainedAt: "2025-11-03T12:00:00" },
          { level: 2, obtainedAt: "2025-12-19T12:00:00" },
          { level: 3, obtainedAt: "2026-09-08T12:00:00" },
        ],
      }),
      progress("test-lab", { value: 10, tier: 1 }),
      progress("locked-0", { value: 10, tier: 1 }),
    ];

    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetAchievementsV2",
    ).mockResolvedValue(paginated(catalog) as never);
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetProgressV2",
    ).mockResolvedValue(progressList as never);
    const obtainedSpy = vi
      .spyOn(
        AchievementsService,
        "achievementsControllerGetAllObtainedAchievementsV1",
      )
      .mockResolvedValueOnce([
        featured("backlog-dragon"),
        featured("locked-0"),
      ] as never)
      .mockResolvedValue([featured("test-lab")] as never);

    const client = createClient();

    renderScreenWithClient(
      <AchievementsScreen targetUserId={"user-1"} />,
      client,
    );

    expect(await screen.findByText("Backlog Dragon · Nível 3")).toBeTruthy();
    // The page only asks for the filtered (featured) list; no unfiltered cache
    // is seeded, which is the common case when opening the Feats page.
    expect(client.getQueryData(obtainedKey())).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: "Trocar" }));
    fireEvent.click(screen.getByRole("button", { name: /Test Lab/ }));

    // The slot must show the chosen feat while the PUT is still in flight,
    // even though "test-lab" was absent from the filtered cache.
    expect(await screen.findByText("Test Lab · Nível 1")).toBeTruthy();
    expect(updateSpy).toHaveBeenCalledWith({
      featuredAchievementIds: ["test-lab"],
    });
    expect(obtainedSpy).toHaveBeenCalledTimes(1);

    // The filtered cache never keeps rows with isFeatured=false.
    expect(client.getQueryData(obtainedKey(true))).toEqual([]);

    updateRequest.resolve();

    await waitFor(() => {
      expect(client.getQueryData(obtainedKey(true))).toEqual([
        expect.objectContaining({
          achievementId: "test-lab",
          isFeatured: true,
        }),
      ]);
    });
    expect(screen.getByText("Test Lab · Nível 1")).toBeTruthy();
    expect(obtainedSpy).toHaveBeenCalledTimes(2);
  });

  it("does not carry a pending featured choice to another user's page", async () => {
    mockServices();
    const request = deferred<void>();
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
    ).mockReturnValue(request.promise as never);

    const client = createClient();
    const view = renderScreenWithClient(
      <AchievementsScreen targetUserId={"user-1"} />,
      client,
    );

    expect(await screen.findByText("Backlog Dragon · Nível 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Trocar" }));
    fireEvent.click(screen.getByRole("button", { name: /Test Lab/ }));
    expect(await screen.findByText("Test Lab · Nível 1")).toBeTruthy();

    view.rerender(<AchievementsScreen targetUserId={"user-2"} />);

    expect(await screen.findByText("Backlog Dragon · Nível 3")).toBeTruthy();
    expect(screen.queryByText("Test Lab · Nível 1")).toBeNull();

    request.resolve();
    await waitFor(() => {
      expect(screen.getByText("Backlog Dragon · Nível 3")).toBeTruthy();
    });
  });

  it("keeps a past events entry when the events section has no rows", async () => {
    const pastEvent = event(
      "retired-event",
      "Evento aposentado",
      "2024-01-01T00:00:00.000Z",
      "2024-06-01T00:00:00.000Z",
    );

    mockServices({
      catalog: buildCatalog([
        feat("missed-feat", {
          name: "Feito perdido",
          event: pastEvent,
        }),
      ]),
      progressList: [],
      featuredList: [],
    });

    renderScreen(<AchievementsScreen targetUserId={"user-1"} />);

    const pastEvents = await screen.findByRole("button", {
      name: /Eventos passados/,
    });
    fireEvent.click(pastEvents);

    expect(await screen.findByText("Evento aposentado")).toBeTruthy();
    expect(screen.getByText("Feito perdido")).toBeTruthy();
  });
});
