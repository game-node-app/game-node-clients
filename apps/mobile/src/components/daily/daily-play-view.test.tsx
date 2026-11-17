// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import {
  DailyPlayResponseDto,
  DailyService,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { DailyPlayView } from "../../../../../packages/ui/src/components/daily/view/DailyPlayView";
import {
  playResponse,
  renderDaily,
  stubMatchMedia,
  todayResponse,
} from "./dailyTestUtils";

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options?.mode ? `${key}:${options.mode}` : key,
    i18n: { language: "en" },
  }),
}));

stubMatchMedia();

const won = playResponse({
  attempts: 2,
  status: DailyPlayResponseDto.status.WON,
  feedback: [
    {
      gameId: 10,
      name: "Wrong game",
      result: "wrong" as never,
      commonGenres: [],
      commonPlatforms: [],
    },
    {
      gameId: 11,
      name: "Answer",
      result: "correct" as never,
      commonGenres: [],
      commonPlatforms: [],
    },
  ],
  answer: {
    id: 11,
    name: "Answer",
    slug: "answer",
    coverUrl: null,
    year: 2001,
  },
});

beforeEach(() => {
  vi.spyOn(DailyService, "dailyControllerFindTodayV1").mockResolvedValue(
    todayResponse() as never,
  );
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindAllByIdsV1",
  ).mockResolvedValue([] as never);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("DailyPlayView", () => {
  it("renders today's finished play with stepper, archive link and next mode", async () => {
    vi.spyOn(DailyService, "dailyControllerPlayV1").mockResolvedValue(
      won as never,
    );
    renderDaily(<DailyPlayView mode={"cover"} />);

    await screen.findByText("Answer", { selector: "h2" });
    expect(
      screen.getByRole("navigation", { name: "GameNode Daily" }),
    ).toBeTruthy();
    expect(screen.getByText("GameNode Daily", { selector: "h1" })).toBeTruthy();
    expect(
      screen.getByText("daily.modes.cover.name", { selector: "h1 + p" }),
    ).toBeTruthy();
    const archive = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/daily/cover/archive");
    expect(archive.length).toBeGreaterThan(0);
    const next = screen.getByText(
      "daily.result.nextMode:daily.modes.artwork.name",
    );
    expect(next.closest("a")?.getAttribute("href")).toBe("/daily/artwork");
    expect(screen.getByText("daily.share.title")).toBeTruthy();
  });

  it("renders an archive play without the stepper or next-mode button", async () => {
    const play = vi
      .spyOn(DailyService, "dailyControllerPlayV1")
      .mockResolvedValue({ ...won, puzzleId: 5 } as never);
    renderDaily(<DailyPlayView mode={"cover"} puzzleId={5} />);

    await screen.findByText("Answer", { selector: "h2" });
    expect(play.mock.calls[0][0]).toBe(5);
    expect(
      screen.queryByRole("navigation", { name: "GameNode Daily" }),
    ).toBeNull();
    expect(screen.queryByText(/daily\.result\.nextMode/)).toBeNull();
    expect(
      screen
        .getAllByRole("link")
        .some((link) => link.getAttribute("href") === "/daily/cover/archive"),
    ).toBe(true);
  });

  it("shows the guess input and lives while in progress", async () => {
    vi.spyOn(DailyService, "dailyControllerPlayV1").mockResolvedValue(
      playResponse() as never,
    );
    const { container } = renderDaily(<DailyPlayView mode={"cover"} />);

    await waitFor(() => expect(container.querySelector("input")).toBeTruthy());
    expect(
      screen.getByRole("navigation", { name: "GameNode Daily" }),
    ).toBeTruthy();
    expect(screen.queryByText("daily.share.title")).toBeNull();
  });
});
