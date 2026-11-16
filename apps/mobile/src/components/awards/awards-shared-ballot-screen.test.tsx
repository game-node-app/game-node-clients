// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import {
  AwardsCategoryTranslationDto,
  AwardsService,
  GameRepositoryService,
  ProfileService,
  type AwardsEventDto,
  type AwardsUserVoteDto,
  type CurrentAwardsEventDto,
  type Game,
  type ProfileResponseDto,
  type VotableAwardsCategoryDto,
} from "@repo/wrapper/server";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AwardsSharedBallotScreen } from "../../../../../packages/ui/src/components/awards/ballot/AwardsSharedBallotScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import { DEFAULT_MANTINE_THEME } from "../../../../../packages/ui/src/util/theme";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

function TestModal(props: ModalComponentProps) {
  return <div role="dialog">{props.opened ? props.children : null}</div>;
}

function TestLink({ href, children, ...rest }: LinkComponentProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

const router = {
  pathname: "/awards/2026/nominees/user-1",
  asPath: "/awards/2026/nominees/user-1",
  back: () => {},
  push: vi.fn(async () => {}),
  query: new URLSearchParams(),
};

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const EN = AwardsCategoryTranslationDto.locale.EN;

function categoryTranslation(
  locale: AwardsCategoryTranslationDto.locale,
  name: string,
  description: string,
): AwardsCategoryTranslationDto {
  return { locale, name, description };
}

function renderScreen(
  ui: ReactElement = (
    <AwardsSharedBallotScreen eventYear={2026} userId={"user-1"} />
  ),
  language: SupportedLanguage = "pt-BR",
) {
  return render(
    <I18nProvider language={language}>
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Modal: TestModal, Link: TestLink }}
            hooks={{ useRouter: () => router }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

function stubMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function buildEvent(phase: string): AwardsEventDto {
  return {
    id: 12,
    year: 2026,
    phase,
    categoriesCount: 10,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    resultsDate: "2026-12-27T00:00:00.000Z",
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: "2026-11-28T23:59:59.000Z",
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as AwardsEventDto;
}

function buildCategory({
  id,
  name,
  order,
  translations = [],
}: {
  id: number;
  name: string;
  order: number;
  translations?: AwardsCategoryTranslationDto[];
}): VotableAwardsCategoryDto {
  return {
    id,
    eventId: 12,
    name,
    order,
    description: `${name} description`,
    translations,
    isGOTY: order === 0,
    isPersonalGOTY: false,
    nomineeCount: 6,
    nomineesFinalizedAt: null,
    isVotable: true,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    suggestions: [],
  } as unknown as VotableAwardsCategoryDto;
}

function buildGame(id: number, name: string): Game {
  return { id, name, cover: null } as unknown as Game;
}

const CATEGORIES = Array.from({ length: 10 }, (_, index) =>
  buildCategory({
    id: 40 + index,
    name: `Categoria ${index + 1}`,
    order: index,
  }),
);

const VOTES: AwardsUserVoteDto[] = CATEGORIES.slice(0, 8).map(
  (category, index) => ({
    categoryId: category.id,
    gameId: 100 + index,
  }),
);

const GAMES = VOTES.map((vote, index) =>
  buildGame(vote.gameId, `Jogo ${index + 1}`),
);

interface LoadOptions {
  phase: string;
  votes?: AwardsUserVoteDto[];
  games?: Game[];
  categories?: VotableAwardsCategoryDto[];
}

function loadScreen({
  phase,
  votes = VOTES,
  games = GAMES,
  categories = CATEGORIES,
}: LoadOptions) {
  const event = buildEvent(phase);

  vi.spyOn(
    AwardsService,
    "awardsControllerGetEventsByYearV1",
  ).mockResolvedValue(event);
  vi.spyOn(
    AwardsService,
    "awardsControllerGetCurrentEventV1",
  ).mockResolvedValue(event as unknown as CurrentAwardsEventDto);
  vi.spyOn(
    AwardsService,
    "awardsControllerGetCategoriesByEventIdV1",
  ).mockResolvedValue(categories);
  const getVotes = vi
    .spyOn(AwardsService, "awardsBallotControllerGetVotesByUserIdV1")
    .mockResolvedValue(votes);
  const findAllByIds = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
    .mockResolvedValue(games);
  vi.spyOn(
    ProfileService,
    "profileControllerFindOneByIdV1",
  ).mockResolvedValue({
    userId: "user-1",
    username: "marina",
  } as unknown as ProfileResponseDto);

  return { getVotes, findAllByIds };
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = undefined;
  stubMatchMedia();
  if (!("ResizeObserver" in globalThis)) {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
      ResizeObserverStub;
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.userId = undefined;
});

describe("AwardsSharedBallotScreen", () => {
  it("shows the owner and the eight voted categories without a session", async () => {
    const { getVotes, findAllByIds } = loadScreen({ phase: "voting" });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Cédula compartilhada")).toBeTruthy(),
    );

    await waitFor(() => expect(screen.getByText("marina")).toBeTruthy());

    expect(getVotes).toHaveBeenCalledWith(12, "user-1");
    expect(findAllByIds).toHaveBeenCalledTimes(1);
    expect(screen.getByText("8 de 10 categorias")).toBeTruthy();

    const rows = Array.from(
      container.querySelectorAll("[data-awards-shared-vote]"),
    );
    expect(rows).toHaveLength(8);
    expect(rows[0]?.textContent).toContain("Categoria 1");
    expect(rows[0]?.textContent).toContain("Jogo 1");
    expect(rows[7]?.textContent).toContain("Categoria 8");
    expect(rows[7]?.textContent).toContain("Jogo 8");

    expect(screen.getByText("Criar conta para votar")).toBeTruthy();
    expect(screen.queryByText("Ir para a minha cédula")).toBeNull();
  });

  it("tells that the user has not voted when the votes read is empty", async () => {
    loadScreen({ phase: "voting", votes: [], games: [] });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText(
          "Este usuário ainda não votou no Awards 2026.",
        ),
      ).toBeTruthy(),
    );

    expect(screen.getByText("Ainda não votou")).toBeTruthy();
    expect(
      container.querySelectorAll("[data-awards-shared-vote]"),
    ).toHaveLength(0);
  });

  it("offers the own ballot shortcut to a signed-in visitor while voting", async () => {
    session.userId = "viewer-1";
    loadScreen({ phase: "voting" });

    renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Ir para a minha cédula")).toBeTruthy(),
    );

    expect(
      screen.getByText("Ir para a minha cédula").closest("a")?.getAttribute(
        "href",
      ),
    ).toBe("/awards/2026/vote");
    expect(screen.queryByText("Criar conta para votar")).toBeNull();
  });

  it("shows the localized category name", async () => {
    loadScreen({
      phase: "voting",
      categories: [
        buildCategory({
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          translations: [
            categoryTranslation(EN, "Game of the Year", "The main award."),
          ],
        }),
        buildCategory({ id: 41, name: "Narrativa", order: 1 }),
      ],
      votes: [
        { categoryId: 40, gameId: 100 },
        { categoryId: 41, gameId: 101 },
      ],
      games: [buildGame(100, "Jogo 1"), buildGame(101, "Jogo 2")],
    });

    const { container } = renderScreen(undefined, "en");

    await waitFor(() =>
      expect(container.textContent).toContain("Game of the Year"),
    );

    const rows = Array.from(
      container.querySelectorAll("[data-awards-shared-vote]"),
    );
    expect(rows[0]?.textContent).toContain("Game of the Year");
    expect(rows[0]?.textContent).not.toContain("Jogo do Ano");
    // The category without an en entry keeps its base name.
    expect(rows[1]?.textContent).toContain("Narrativa");
  });
});
