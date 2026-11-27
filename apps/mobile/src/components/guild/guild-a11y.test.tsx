// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import type {
  ClaimGuildContractResponseDto,
  GuildBoardQuestDto,
  GuildOverviewCountsDto,
} from "@repo/wrapper/server";
import { createRef, type ReactElement, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GuildClaimCelebration } from "../../../../../packages/ui/src/components/guild/view/GuildClaimCelebration";
import {
  getGuildTabId,
  getGuildTabPanelId,
  GuildTabs,
  type GuildTab,
} from "../../../../../packages/ui/src/components/guild/view/GuildTabs";
import { GuildTargetGamePicker } from "../../../../../packages/ui/src/components/guild/view/GuildTargetGamePicker";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";

vi.mock(
  "../../../../../packages/ui/src/components/guild/scene/LinaSprite",
  () => ({
    LinaSprite: () => <span data-testid="lina-sprite" />,
  }),
);

function TestModal({
  opened,
  onClose,
  title,
  fullScreen,
  children,
}: ModalComponentProps) {
  if (!opened) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label={title ?? undefined}
      data-fullscreen={String(Boolean(fullScreen))}
    >
      {title ? <span>{title}</span> : null}
      <button type="button" onClick={onClose}>
        close
      </button>
      {children}
    </div>
  );
}

const router = {
  pathname: "/guild",
  asPath: "/guild",
  back: () => {},
  push: vi.fn(async () => {}),
  query: new URLSearchParams(),
};

function renderScreen(ui: ReactElement, language: SupportedLanguage = "en") {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <I18nProvider language={language}>
      <MantineProvider>
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

function mockMatchMedia(mobileMatches: boolean, reducedMotion = false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion")
      ? reducedMotion
      : query === "(max-width: 47.99em)" && mobileMatches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const TAB_COUNTS: GuildOverviewCountsDto = {
  boardCount: 4,
  acceptedCount: 2,
  completedCount: 7,
} as GuildOverviewCountsDto;

const QUEST_WITH_CANDIDATES = {
  id: "quest-1",
  category: "library",
  templateKey: "forgotten_relic",
  rank: "B",
  xpReward: 250,
  sealsReward: 10,
  objectiveType: "finish_game",
  criteria: {},
  requiresTargetGame: true,
  candidateGames: [
    {
      gameId: 101,
      name: "Hollow Knight",
      coverUrl: null,
      sinceYear: 2019,
      estimatedHours: null,
    },
    {
      gameId: 202,
      name: "Celeste",
      coverUrl: null,
      sinceYear: null,
      estimatedHours: 8,
    },
    {
      gameId: 303,
      name: "Hades",
      coverUrl: null,
      sinceYear: 2021,
      estimatedHours: null,
    },
  ],
} as unknown as GuildBoardQuestDto;

const CLAIM_RESULT = {
  contract: {
    id: "contract-1",
    boardEntryId: "board-1",
    eventId: null,
    category: "library",
    templateKey: "forgotten_relic",
    rank: "B",
    xpReward: 250,
    objectiveType: "finish_game",
    criteria: {},
    targetGameId: 101,
    targetGame: {
      gameId: 101,
      name: "Hollow Knight",
      slug: "hollow-knight",
      coverUrl: null,
    },
    progressCurrent: 1,
    progressTarget: 1,
    status: "completed",
    playtimeProgress: null,
    reward: null,
    event: null,
    claimPayload: null,
    acceptedAt: new Date().toISOString(),
    readyAt: new Date().toISOString(),
    claimedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  xpAwarded: 250,
  globalXpAwarded: 0,
  rankBefore: "B",
  rankAfter: "B",
  unlockedRewards: [],
  chestResult: null,
  lina: null,
} as unknown as ClaimGuildContractResponseDto;

beforeEach(() => {
  mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("GuildTabs accessibility", () => {
  it("sets id, aria-controls, roving tabIndex, and forwards boardTabRef", () => {
    const boardTabRef = createRef<HTMLButtonElement>();

    renderScreen(
      <GuildTabs
        counts={TAB_COUNTS}
        activeTab="accepted"
        onChange={vi.fn()}
        nextRefreshAt={new Date(Date.now() + 3_600_000).toISOString()}
        boardTabRef={boardTabRef}
      />,
    );

    const tabs = screen.getAllByRole("tab");
    const orderedIds: GuildTab[] = [
      "board",
      "accepted",
      "completed",
      "arcs",
      "bounties",
      "emporium",
    ];

    expect(tabs).toHaveLength(6);
    orderedIds.forEach((tabId, index) => {
      const button = tabs[index]!;
      expect(button).toHaveAttribute("id", getGuildTabId(tabId));
      expect(button).toHaveAttribute(
        "aria-controls",
        getGuildTabPanelId(tabId),
      );
      expect(button).toHaveAttribute(
        "aria-selected",
        tabId === "accepted" ? "true" : "false",
      );
      expect(button).toHaveAttribute(
        "tabindex",
        tabId === "accepted" ? "0" : "-1",
      );
    });

    expect(boardTabRef.current).toBe(tabs[0]);
  });

  it("supports ArrowRight, ArrowLeft, Home, and End with wrapping and focus movement", () => {
    const nextRefreshAt = new Date(Date.now() + 3_600_000).toISOString();

    function ControlledTabs() {
      const [activeTab, setActiveTab] = useState<GuildTab>("board");
      return (
        <GuildTabs
          counts={TAB_COUNTS}
          activeTab={activeTab}
          onChange={setActiveTab}
          nextRefreshAt={nextRefreshAt}
        />
      );
    }

    renderScreen(<ControlledTabs />);

    const getTab = (tabId: GuildTab) =>
      document.getElementById(getGuildTabId(tabId)) as HTMLButtonElement;

    getTab("board").focus();
    expect(document.activeElement).toBe(getTab("board"));

    fireEvent.keyDown(getTab("board"), { key: "ArrowRight" });
    expect(getTab("accepted")).toHaveAttribute("aria-selected", "true");
    expect(getTab("accepted")).toHaveAttribute("tabindex", "0");
    expect(getTab("board")).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(getTab("accepted"));

    fireEvent.keyDown(getTab("accepted"), { key: "End" });
    expect(getTab("emporium")).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(getTab("emporium"));

    fireEvent.keyDown(getTab("emporium"), { key: "ArrowRight" });
    expect(getTab("board")).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(getTab("board"));

    fireEvent.keyDown(getTab("board"), { key: "ArrowLeft" });
    expect(getTab("emporium")).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(getTab("emporium"));

    fireEvent.keyDown(getTab("emporium"), { key: "Home" });
    expect(getTab("board")).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(getTab("board"));
  });
});

describe("GuildTargetGamePicker accessibility", () => {
  it("implements roving tabIndex and Arrow/Home/End keyboard navigation without nested links", () => {
    renderScreen(
      <GuildTargetGamePicker
        opened
        quest={QUEST_WITH_CANDIDATES}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
    expect(radios[2]).toHaveAttribute("aria-checked", "false");

    for (const radio of radios) {
      expect(radio.querySelector("a")).toBeNull();
    }

    radios[0]!.focus();
    expect(document.activeElement).toBe(radios[0]);

    fireEvent.keyDown(radios[0]!, { key: "ArrowDown" });
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("tabindex", "0");
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(radios[1]);

    fireEvent.keyDown(radios[1]!, { key: "End" });
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(document.activeElement).toBe(radios[2]);

    fireEvent.keyDown(radios[2]!, { key: "ArrowRight" });
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(document.activeElement).toBe(radios[0]);

    fireEvent.keyDown(radios[0]!, { key: "ArrowUp" });
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(document.activeElement).toBe(radios[2]);

    fireEvent.keyDown(radios[2]!, { key: "Home" });
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(document.activeElement).toBe(radios[0]);
  });

  it("keeps the first radio option focusable when no candidate is selected yet", () => {
    const view = renderScreen(
      <GuildTargetGamePicker
        opened={false}
        quest={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    view.rerender(
      <I18nProvider language="en">
        <MantineProvider>
          <QueryClientProvider
            client={
              new QueryClient({
                defaultOptions: {
                  queries: { retry: false },
                  mutations: { retry: false },
                },
              })
            }
          >
            <UIProvider
              presenters={{ Modal: TestModal }}
              hooks={{ useRouter: () => router }}
            >
              <GuildTargetGamePicker
                opened
                quest={QUEST_WITH_CANDIDATES}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
              />
            </UIProvider>
          </QueryClientProvider>
        </MantineProvider>
      </I18nProvider>,
    );

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
  });
});

describe("GuildClaimCelebration mobile fullscreen", () => {
  it("passes fullScreen={true} to Modal on mobile viewports", () => {
    mockMatchMedia(true);

    renderScreen(
      <GuildClaimCelebration opened onClose={vi.fn()} result={CLAIM_RESULT} />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-fullscreen",
      "true",
    );
  });

  it("passes fullScreen={false} to Modal on desktop viewports", () => {
    mockMatchMedia(false);

    renderScreen(
      <GuildClaimCelebration opened onClose={vi.fn()} result={CLAIM_RESULT} />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-fullscreen",
      "false",
    );
  });
});

describe("GuildClaimCelebration reduced motion", () => {
  it("shows the awarded XP right away instead of zero", () => {
    mockMatchMedia(false, true);

    renderScreen(
      <GuildClaimCelebration opened onClose={vi.fn()} result={CLAIM_RESULT} />,
    );

    expect(screen.getByText("+250 Guild XP")).toBeInTheDocument();
  });
});
