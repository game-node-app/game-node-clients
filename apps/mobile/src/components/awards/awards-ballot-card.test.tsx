// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AwardsBallotCard,
  type AwardsBallotCardCategory,
} from "../../../../../packages/ui/src/components/awards/ballot/AwardsBallotCard";
import { AwardsBallotShareScreen } from "../../../../../packages/ui/src/components/awards/ballot/AwardsBallotShareScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import { DEFAULT_MANTINE_THEME } from "../../../../../packages/ui/src/util/theme";

const mocks = vi.hoisted(() => ({
  toBlob: vi.fn(),
  shareText: vi.fn(async (_text: string) => true),
}));

vi.mock("html-to-image", () => ({
  toBlob: mocks.toBlob,
}));

// Font loading is a browser boundary: the suite must never depend on it. Other
// test files stub `document.fonts` without `load`, and that can leak into this
// file when they share a worker, which made the share export throw.
vi.mock(
  "../../../../../packages/ui/src/components/awards/ballot/AwardsBallotFonts",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../../packages/ui/src/components/awards/ballot/AwardsBallotFonts")
    >()),
    loadAwardsBallotFonts: vi.fn(async () => {}),
  }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

function TestModal({ opened, onClose, title, children }: ModalComponentProps) {
  if (!opened) {
    return null;
  }

  return (
    <div role={"dialog"}>
      <span>{title}</span>
      <button type={"button"} onClick={onClose}>
        close
      </button>
      {children}
    </div>
  );
}

function TestLink({ href, children, ...rest }: LinkComponentProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

const router = {
  pathname: "/awards/2026/vote",
  asPath: "/awards/2026/vote",
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

function renderWithProviders(
  ui: ReactElement,
  language: SupportedLanguage = "pt-BR",
) {
  return render(
    <I18nProvider language={language}>
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Modal: TestModal, Link: TestLink }}
            hooks={{ useRouter: () => router, shareText: mocks.shareText }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

function makeGame(
  id: number,
  name: string,
  {
    developer,
    publisher,
    platforms = [],
  }: {
    developer?: string;
    publisher?: string;
    platforms?: string[];
  } = {},
): Game {
  const involvedCompanies = [
    developer
      ? {
          developer: true,
          publisher: false,
          company: { id: 1, name: developer },
        }
      : null,
    publisher
      ? {
          developer: false,
          publisher: true,
          company: { id: 2, name: publisher },
        }
      : null,
  ].filter(Boolean);

  return {
    id,
    name,
    cover: { id, image_id: `co${id}` },
    platforms: platforms.map((abbreviation, index) => ({
      id: index + 1,
      abbreviation,
      name: abbreviation,
    })),
    involvedCompanies,
  } as unknown as Game;
}

function buildCategories(
  total: number,
  votedCount: number,
  {
    gotyVoted = true,
    includePersonalGOTY = false,
  }: { gotyVoted?: boolean; includePersonalGOTY?: boolean } = {},
): { categories: AwardsBallotCardCategory[]; gamesById: Map<number, Game> } {
  const categories: AwardsBallotCardCategory[] = [];
  const gamesById = new Map<number, Game>();
  let remainingVotes = votedCount;

  for (let i = 0; i < total; i += 1) {
    const isPersonalGOTY = includePersonalGOTY && i === 1;
    let voteGameId: number | null = null;

    if (i === 0) {
      if (gotyVoted && remainingVotes > 0) {
        voteGameId = 1000 + i;
        remainingVotes -= 1;
      }
    } else if (remainingVotes > 0) {
      voteGameId = 1000 + i;
      remainingVotes -= 1;
    }

    categories.push({
      id: i + 1,
      name:
        i === 0
          ? "Jogo do Ano"
          : isPersonalGOTY
            ? "Seu GOTY pessoal"
            : `Categoria ${i + 1}`,
      voteGameId,
      isGOTY: i === 0,
    });

    if (voteGameId != null) {
      gamesById.set(
        voteGameId,
        makeGame(voteGameId, i === 0 ? "Nioh 3" : `Game ${i + 1}`, {
          developer: i === 0 ? "Koei Tecmo" : "Studio",
          platforms: i === 0 ? ["PS5", "PC", "XSX", "Switch"] : ["PC"],
        }),
      );
    }
  }

  return { categories, gamesById };
}

beforeEach(() => {
  vi.clearAllMocks();
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
});

describe("AwardsBallotCard", () => {
  it("renders GOTY hero, 10 grid rows in ballot order, pill and SVGs on complete 11-category ballot", () => {
    const { categories, gamesById } = buildCategories(11, 11);

    const { container } = renderWithProviders(
      <AwardsBallotCard
        eventYear={2026}
        username={"marina"}
        categories={categories}
        totalCategories={11}
        gamesById={gamesById}
      />,
    );

    const card = container.querySelector(
      "[data-awards-ballot-card]",
    ) as HTMLElement;
    expect(card).toBeTruthy();
    expect(card.style.width).toBe("1080px");
    expect(card.style.height).toBe("1920px");

    const images = Array.from(card.querySelectorAll("img")).map((img) =>
      img.getAttribute("src"),
    );
    expect(images).toContain("/img/awards/ballot-wordmark.svg");
    expect(images).toContain("/img/awards/ballot-glow.svg");

    expect(
      card.querySelector("[data-awards-ballot-card-handle]")?.textContent,
    ).toBe("@marina");

    const hero = card.querySelector("[data-awards-ballot-card-hero]");
    expect(hero).toBeTruthy();
    expect(hero?.textContent).toContain("Jogo do Ano");
    expect(hero?.textContent).toContain("Nioh 3");
    expect(hero?.textContent).toContain("Koei Tecmo · PS5, PC, XSX");
    expect(hero?.textContent).not.toContain("Switch");

    const rows = Array.from(
      card.querySelectorAll("[data-awards-ballot-card-row]"),
    );
    expect(rows).toHaveLength(10);
    expect(rows.map((row) => row.getAttribute("data-category-id"))).toEqual([
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
    ]);

    expect(
      card.querySelector("[data-awards-ballot-card-remaining]"),
    ).toBeNull();

    const pill = card.querySelector("[data-awards-ballot-card-pill]");
    expect(pill?.textContent).toBe("11 de 11 categorias");
  });

  it("hides unvoted categories and renders dashed remaining block (plural and singular)", () => {
    const partial6 = buildCategories(11, 6);
    const { container, rerender } = renderWithProviders(
      <AwardsBallotCard
        eventYear={2026}
        username={"marina"}
        categories={partial6.categories}
        totalCategories={11}
        gamesById={partial6.gamesById}
      />,
    );

    expect(
      container.querySelector("[data-awards-ballot-card-hero]"),
    ).toBeTruthy();
    expect(
      container.querySelectorAll("[data-awards-ballot-card-row]"),
    ).toHaveLength(5);

    const remainingBlock = container.querySelector(
      "[data-awards-ballot-card-remaining]",
    );
    expect(remainingBlock?.textContent).toContain("Faltam 5 categorias");
    expect(remainingBlock?.textContent).toContain(
      "Vote no Awards 2026 e monte a sua cédula.",
    );
    expect(
      container.querySelector("[data-awards-ballot-card-pill]")?.textContent,
    ).toBe("6 de 11 categorias");

    const partial10 = buildCategories(11, 10);
    rerender(
      <I18nProvider language={"pt-BR"}>
        <MantineProvider theme={DEFAULT_MANTINE_THEME}>
          <QueryClientProvider client={createClient()}>
            <UIProvider
              presenters={{ Modal: TestModal, Link: TestLink }}
              hooks={{ useRouter: () => router, shareText: mocks.shareText }}
            >
              <AwardsBallotCard
                eventYear={2026}
                username={"marina"}
                categories={partial10.categories}
                totalCategories={11}
                gamesById={partial10.gamesById}
              />
            </UIProvider>
          </QueryClientProvider>
        </MantineProvider>
      </I18nProvider>,
    );

    expect(
      container.querySelector("[data-awards-ballot-card-remaining]")
        ?.textContent,
    ).toContain("Falta 1 categoria");
  });

  it("omits the hero card when GOTY has no vote and places all voted categories in the grid", () => {
    const { categories, gamesById } = buildCategories(5, 3, {
      gotyVoted: false,
    });

    const { container } = renderWithProviders(
      <AwardsBallotCard
        eventYear={2026}
        categories={categories}
        totalCategories={5}
        gamesById={gamesById}
      />,
    );

    expect(
      container.querySelector("[data-awards-ballot-card-hero]"),
    ).toBeNull();
    expect(
      container.querySelectorAll("[data-awards-ballot-card-row]"),
    ).toHaveLength(3);
    expect(
      container.querySelector("[data-awards-ballot-card-remaining]")
        ?.textContent,
    ).toContain("Faltam 2 categorias");
    expect(
      container.querySelector("[data-awards-ballot-card-pill]")?.textContent,
    ).toBe("3 de 5 categorias");
  });

  it("renders personal GOTY as a grid row instead of the hero card", () => {
    const categories: AwardsBallotCardCategory[] = [
      { id: 1, name: "Seu GOTY pessoal", voteGameId: 501, isGOTY: false },
      { id: 2, name: "Direção de Arte", voteGameId: 502, isGOTY: false },
    ];
    const gamesById = new Map<number, Game>([
      [501, makeGame(501, "Personal Pick")],
      [502, makeGame(502, "Art Pick")],
    ]);

    const { container } = renderWithProviders(
      <AwardsBallotCard
        eventYear={2026}
        categories={categories}
        totalCategories={2}
        gamesById={gamesById}
      />,
    );

    expect(
      container.querySelector("[data-awards-ballot-card-hero]"),
    ).toBeNull();
    const rows = container.querySelectorAll("[data-awards-ballot-card-row]");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toContain("Seu GOTY pessoal");
    expect(rows[0]?.textContent).toContain("Personal Pick");
  });

  it("omits hero metadata line when developer, publisher and platforms are missing", () => {
    const categories: AwardsBallotCardCategory[] = [
      { id: 1, name: "Jogo do Ano", voteGameId: 777, isGOTY: true },
    ];
    const gamesById = new Map<number, Game>([
      [777, makeGame(777, "Indie Gem")],
    ]);

    const { container } = renderWithProviders(
      <AwardsBallotCard
        eventYear={2026}
        categories={categories}
        totalCategories={1}
        gamesById={gamesById}
      />,
    );

    const hero = container.querySelector("[data-awards-ballot-card-hero]");
    expect(hero?.textContent).toContain("Indie Gem");
    expect(hero?.textContent).not.toContain("·");
  });
});

describe("AwardsBallotShareScreen", () => {
  it("renders 0.24 preview over 1080x1920 card and wires stories share, download, copy link and close", async () => {
    const { categories, gamesById } = buildCategories(11, 11);
    const onClose = vi.fn();
    const onShare = vi.fn(async (_file: File) => {});
    const onDownload = vi.fn(async (_file: File) => {});
    const writeText = vi.fn(async () => {});
    const originalClipboard = navigator.clipboard;

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    mocks.toBlob.mockResolvedValue(
      new Blob(["png-bytes"], { type: "image/png" }),
    );

    try {
      const { container } = renderWithProviders(
        <AwardsBallotShareScreen
          eventYear={2026}
          userId={"user-1"}
          username={"marina"}
          categories={categories}
          totalCategories={11}
          gamesById={gamesById}
          onClose={onClose}
          onShare={onShare}
          onDownload={onDownload}
        />,
      );

      expect(screen.getByText("Sua cédula")).toBeTruthy();

      const nativeCardWrapper = container.querySelector(
        '[data-testid="awards-ballot-card"]',
      ) as HTMLElement;
      expect(nativeCardWrapper.style.width).toBe("1080px");
      expect(nativeCardWrapper.style.height).toBe("1920px");

      const frame = nativeCardWrapper.parentElement
        ?.parentElement as HTMLElement;
      expect(parseFloat(frame.style.width)).toBeCloseTo(1080 * 0.24, 1);
      expect(parseFloat(frame.style.height)).toBeCloseTo(1920 * 0.24, 1);

      fireEvent.click(screen.getByText("Compartilhar nos stories"));

      await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
      expect(mocks.toBlob).toHaveBeenCalledWith(
        nativeCardWrapper,
        expect.objectContaining({
          width: 1080,
          height: 1920,
          pixelRatio: 1,
          type: "image/png",
        }),
      );
      const sharedFile = onShare.mock.calls[0]?.[0];
      expect(sharedFile).toBeInstanceOf(File);
      expect(sharedFile?.name).toMatch(/^gamenode-awards-2026-ballot-.*\.png$/);
      expect(sharedFile?.type).toBe("image/png");

      fireEvent.click(screen.getByText("Baixar imagem"));
      await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
      expect(onDownload.mock.calls[0]?.[0]).toBeInstanceOf(File);

      fireEvent.click(screen.getByText("Copiar link da cédula"));
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      expect(writeText).toHaveBeenCalledWith(
        "https://gamenode.app/awards/2026/nominees/user-1",
      );

      fireEvent.click(
        container.querySelector("[data-awards-ballot-share-close]")!,
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }
  });
});
