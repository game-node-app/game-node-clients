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
import { I18nProvider } from "@repo/locales";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TGameOrSearchGame } from "../../../../../packages/ui/src/components/game/util/types";
import type { AwardsCategoryListRow } from "../../../../../packages/ui/src/components/awards/shared/AwardsCategoryList";
import { AwardsCategoryList } from "../../../../../packages/ui/src/components/awards/shared/AwardsCategoryList";
import { AwardsCategoryLayout } from "../../../../../packages/ui/src/components/awards/shared/AwardsCategoryLayout";
import { AwardsCategoryPanel } from "../../../../../packages/ui/src/components/awards/shared/AwardsCategoryPanel";
import { AwardsNomineeCard } from "../../../../../packages/ui/src/components/awards/shared/AwardsNomineeCard";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import { DEFAULT_MANTINE_THEME } from "../../../../../packages/ui/src/util/theme";

// Mantine's SegmentedControl measures itself with ResizeObserver.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
    ResizeObserverStub;
}

function TestModal({ opened, onClose, title, children }: ModalComponentProps) {
  if (!opened) {
    return null;
  }

  return (
    <div role="dialog">
      <span>{title}</span>
      <button type="button" onClick={onClose}>
        close
      </button>
      {children}
    </div>
  );
}

const router = {
  pathname: "/awards/2026/vote",
  asPath: "/awards/2026/vote",
  back: () => {},
  push: async () => {},
  query: new URLSearchParams(),
};

function renderWithProviders(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <I18nProvider language="pt-BR">
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={client}>
          <UIProvider
            presenters={{ Modal: TestModal }}
            hooks={{ useRouter: () => router }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

function stubMatchMedia({ mobile = false } = {}) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: mobile && (query.includes("62em") || query.includes("48em")),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const game = (id: number, name: string): TGameOrSearchGame =>
  ({ id, name }) as TGameOrSearchGame;

beforeEach(() => {
  stubMatchMedia();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AwardsCategoryList", () => {
  it("renders the active, voted and pending rows with the suggestion hint", () => {
    const onSelect = vi.fn();
    const categories: AwardsCategoryListRow[] = [
      { id: 40, name: "Jogo do Ano", state: "active" },
      {
        id: 41,
        name: "Narrativa",
        state: "voted",
        game: game(101, "Nioh 3"),
      },
      {
        id: 42,
        name: "Seu GOTY pessoal",
        state: "pending",
        suggestionGameName: "Nioh 3",
      },
    ];

    const { container } = renderWithProviders(
      <AwardsCategoryList
        categories={categories}
        onSelect={onSelect}
        title="Sua cédula"
        current={1}
        total={3}
      />,
    );

    expect(screen.getByText("Sua cédula")).toBeTruthy();
    expect(screen.getByText("1 de 3")).toBeTruthy();
    expect(screen.getByText("Escolhendo")).toBeTruthy();
    expect(screen.getByText("Seu voto")).toBeTruthy();
    expect(screen.queryByText("Votar")).toBeNull();
    expect(screen.getByText("Sugerido: Nioh 3")).toBeTruthy();

    const rows = container.querySelectorAll("[data-awards-category-row]");
    expect(rows).toHaveLength(3);
    expect(rows[0]?.getAttribute("data-state")).toBe("active");
    expect(rows[1]?.getAttribute("data-state")).toBe("voted");
    expect(rows[1]?.querySelector("[data-awards-row-check]")).toBeTruthy();
    expect(rows[1]?.querySelector("[data-awards-row-cover]")).toBeTruthy();
    expect(rows[2]?.getAttribute("data-state")).toBe("pending");

    fireEvent.click(screen.getByText("Narrativa"));
    expect(onSelect).toHaveBeenCalledWith(41);
  });
});

describe("AwardsNomineeCard", () => {
  it("shows a played game with hours and the ballot rating", () => {
    const { container } = renderWithProviders(
      <AwardsNomineeCard
        gameId={101}
        game={game(101, "Nioh 3")}
        status={"played"}
        playtimeSeconds={309600}
        rating={4.5}
        metadata={"Koei Tecmo · PS5, PC"}
      />,
    );

    expect(screen.getByText("Nioh 3")).toBeTruthy();
    expect(screen.getByText("Koei Tecmo · PS5, PC")).toBeTruthy();
    expect(screen.getByText("Você jogou · 86 h · nota 9")).toBeTruthy();

    const chip = container.querySelector('[data-awards-chip="played"]');
    expect(chip?.getAttribute("data-color")).toBe("teal");
    expect(chip?.className).toContain("bg-state-played-tint");
  });

  it("omits the hours label and the rating when they are absent", () => {
    renderWithProviders(
      <AwardsNomineeCard
        gameId={101}
        game={game(101, "Nioh 3")}
        status={"played"}
        playtimeSeconds={0}
        rating={null}
      />,
    );

    expect(screen.getByText("Você jogou")).toBeTruthy();
    expect(screen.queryByText(/0 h/)).toBeNull();
    expect(screen.queryByText(/nota/)).toBeNull();
  });

  it("uses the brand chip for planned and the gray chip for not played", () => {
    const planned = renderWithProviders(
      <AwardsNomineeCard
        gameId={102}
        game={game(102, "Saros")}
        status={"planned"}
      />,
    );

    expect(screen.getByText("Na sua lista de desejos")).toBeTruthy();
    expect(
      planned.container
        .querySelector('[data-awards-chip="planned"]')
        ?.getAttribute("data-color"),
    ).toBe("brand");
    planned.unmount();

    const notPlayed = renderWithProviders(
      <AwardsNomineeCard
        gameId={103}
        game={game(103, "Pragmata")}
        status={"not_played"}
      />,
    );

    expect(screen.getByText("Ainda não jogou")).toBeTruthy();
    expect(
      notPlayed.container
        .querySelector('[data-awards-chip="not_played"]')
        ?.getAttribute("data-color"),
    ).toBe("gray");
  });

  it("uses the short mobile copy for planned and not played", () => {
    stubMatchMedia({ mobile: true });

    const planned = renderWithProviders(
      <AwardsNomineeCard
        gameId={102}
        game={game(102, "Saros")}
        status={"planned"}
      />,
    );
    expect(screen.getByText("Na sua lista")).toBeTruthy();
    planned.unmount();

    renderWithProviders(
      <AwardsNomineeCard
        gameId={103}
        game={game(103, "Pragmata")}
        status={"not_played"}
      />,
    );
    expect(screen.getByText("Não jogou")).toBeTruthy();
  });

  it("marks the selected vote and exposes the nominations remove action", () => {
    const onRemove = vi.fn();
    const onSelect = vi.fn();

    renderWithProviders(
      <AwardsNomineeCard
        gameId={101}
        game={game(101, "Nioh 3")}
        selected
        onSelect={onSelect}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("Seu voto")).toBeTruthy();
    expect(
      screen
        .getByText("Seu voto")
        .closest("[data-awards-nominee-card]")
        ?.getAttribute("data-selected"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    expect(onRemove).toHaveBeenCalledWith(101);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("AwardsCategoryPanel", () => {
  it("shows the category position, description and played filter", () => {
    renderWithProviders(
      <AwardsCategoryPanel
        index={0}
        total={12}
        name={"Jogo do Ano"}
        description={"Lançados entre 1 jan e 30 nov de 2026."}
        nominees={[
          {
            gameId: 101,
            game: game(101, "Nioh 3"),
            status: "played",
            playtimeSeconds: 309600,
            rating: 4.5,
          },
          {
            gameId: 102,
            game: game(102, "Saros"),
            status: "planned",
          },
        ]}
        playedNomineesCount={1}
      />,
    );

    expect(screen.getByText("Categoria 01 de 12")).toBeTruthy();
    expect(
      screen.getByText("Lançados entre 1 jan e 30 nov de 2026."),
    ).toBeTruthy();
    expect(screen.getByText("Todos · 2")).toBeTruthy();
    expect(screen.getByText("Que joguei · 1")).toBeTruthy();
    expect(screen.getByText("Nioh 3")).toBeTruthy();
    expect(screen.getByText("Saros")).toBeTruthy();

    fireEvent.click(screen.getByText("Que joguei · 1"));

    expect(screen.getByText("Nioh 3")).toBeTruthy();
    expect(screen.queryByText("Saros")).toBeNull();
  });

  it("hides the played filter when the cards have no nominee status", () => {
    renderWithProviders(
      <AwardsCategoryPanel
        index={11}
        total={12}
        name={"Seu GOTY pessoal"}
        nominees={[
          {
            gameId: 101,
            game: game(101, "Nioh 3"),
            selected: true,
            selectedLabel: "Sua indicação",
          },
        ]}
      />,
    );

    expect(screen.getByText("Categoria 12 de 12")).toBeTruthy();
    expect(screen.queryByText(/Que joguei/)).toBeNull();
    expect(screen.getByText("Sua indicação")).toBeTruthy();
  });
});

describe("AwardsCategoryLayout", () => {
  const categories: AwardsCategoryListRow[] = [
    { id: 40, name: "Jogo do Ano", state: "active" },
    {
      id: 41,
      name: "Narrativa",
      state: "voted",
      game: game(101, "Nioh 3"),
    },
  ];

  it("renders the two-column desktop layout above md", () => {
    const onSelectCategory = vi.fn();
    const { container } = renderWithProviders(
      <AwardsCategoryLayout
        categories={categories}
        onSelectCategory={onSelectCategory}
        title={"Sua cédula"}
        current={1}
        total={2}
      >
        <div>painel ativo</div>
      </AwardsCategoryLayout>,
    );

    expect(
      container.querySelector('[data-awards-layout="desktop"]'),
    ).toBeTruthy();
    expect(screen.getByText("Sua cédula")).toBeTruthy();
    expect(screen.getByText("1 de 2")).toBeTruthy();
    expect(screen.getByText("painel ativo")).toBeTruthy();
    expect(
      container.querySelector("[data-awards-categories-button]"),
    ).toBeNull();
  });

  it("renders the mobile layout with progress, modal list and the bottom bar slot", async () => {
    stubMatchMedia({ mobile: true });
    const onSelectCategory = vi.fn();
    const { container } = renderWithProviders(
      <AwardsCategoryLayout
        categories={categories}
        onSelectCategory={onSelectCategory}
        title={"Sua cédula"}
        current={1}
        total={2}
        voteBar={<div>barra de voto</div>}
      >
        <div>painel ativo</div>
      </AwardsCategoryLayout>,
    );

    await waitFor(() =>
      expect(
        container.querySelector('[data-awards-layout="mobile"]'),
      ).toBeTruthy(),
    );

    const segments = container.querySelectorAll(
      "[data-awards-progress-segment]",
    );
    expect(segments).toHaveLength(2);
    expect(segments[0]?.getAttribute("data-state")).toBe("active");
    expect(segments[1]?.getAttribute("data-state")).toBe("voted");

    expect(screen.getByText("painel ativo")).toBeTruthy();
    expect(
      container
        .querySelector("[data-awards-vote-bar]")
        ?.getAttribute("data-fixed"),
    ).toBe("true");
    expect(screen.getByText("barra de voto")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByText("Categorias"));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByRole("dialog").querySelectorAll("[data-awards-category-row]"),
    ).toHaveLength(2);

    fireEvent.click(screen.getByText("Narrativa"));

    expect(onSelectCategory).toHaveBeenCalledWith(41);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
