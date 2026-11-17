// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  DailyPracticePlayResponseDto,
  DailyService,
} from "@repo/wrapper/server";
import {
  DAILY_PRACTICE_STORAGE_KEY,
  useDailyPractice,
} from "../../../../../packages/ui/src/components/daily/practice/useDailyPractice";
import { DailyPracticeView } from "../../../../../packages/ui/src/components/daily/practice/DailyPracticeView";
import {
  createTestQueryClient,
  renderDaily,
  stubMatchMedia,
} from "./dailyTestUtils";

const mocks = vi.hoisted(() => ({ userId: undefined as string | undefined }));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({
      data: mocks.userId ? { user: { id: mocks.userId } } : null,
      isPending: false,
    }),
  },
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${Object.values(options).join(",")}` : key,
    i18n: { language: "en" },
  }),
}));

stubMatchMedia();

const round = (
  roundId: string,
  overrides: Partial<DailyPracticePlayResponseDto> = {},
): DailyPracticePlayResponseDto => ({
  roundId,
  mode: DailyPracticePlayResponseDto.mode.COVER,
  maxAttempts: 6,
  attempts: 0,
  status: DailyPracticePlayResponseDto.status.IN_PROGRESS,
  feedback: [],
  hints: { imageTokens: ["token-1"], keywords: [] },
  hintAvailable: false,
  hintAt: null,
  ...overrides,
});

const apiError = (status: number) =>
  new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/daily/practice",
      body: null,
      ok: false,
    },
    "practice error",
  );

const storedRounds = () =>
  JSON.parse(localStorage.getItem(DAILY_PRACTICE_STORAGE_KEY) ?? "{}");

const renderPractice = (client = createTestQueryClient()) => {
  return renderHook(() => useDailyPractice("cover"), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  mocks.userId = undefined;
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("useDailyPractice", () => {
  it("starts a round and stores its id for the guest", async () => {
    const start = vi
      .spyOn(DailyService, "dailyControllerStartPracticeV1")
      .mockResolvedValue(round("r1"));
    const play = vi.spyOn(DailyService, "dailyControllerPlayPracticeV1");
    const { result } = renderPractice();

    await waitFor(() => expect(result.current.data?.roundId).toBe("r1"));
    expect(start).toHaveBeenCalledWith({ mode: "cover" });
    expect(play).not.toHaveBeenCalled();
    expect(storedRounds()).toEqual({ guest: { cover: "r1" } });
  });

  it("resumes the stored round with an empty play", async () => {
    mocks.userId = "me";
    localStorage.setItem(
      DAILY_PRACTICE_STORAGE_KEY,
      JSON.stringify({ me: { cover: "r1" } }),
    );
    const start = vi.spyOn(DailyService, "dailyControllerStartPracticeV1");
    const play = vi
      .spyOn(DailyService, "dailyControllerPlayPracticeV1")
      .mockResolvedValue(round("r1", { attempts: 2 }));
    const { result } = renderPractice();

    await waitFor(() => expect(result.current.data?.attempts).toBe(2));
    expect(play).toHaveBeenCalledWith("r1", { guesses: [], hintAt: null });
    expect(start).not.toHaveBeenCalled();
  });

  it.each([404, 403])(
    "drops a round the server rejects with %s and starts a new one",
    async (status) => {
      localStorage.setItem(
        DAILY_PRACTICE_STORAGE_KEY,
        JSON.stringify({ guest: { cover: "old", specs: "s1" } }),
      );
      vi.spyOn(DailyService, "dailyControllerPlayPracticeV1").mockRejectedValue(
        apiError(status),
      );
      vi.spyOn(
        DailyService,
        "dailyControllerStartPracticeV1",
      ).mockResolvedValue(round("new"));
      const { result } = renderPractice();

      await waitFor(() => expect(result.current.data?.roundId).toBe("new"));
      expect(storedRounds()).toEqual({ guest: { cover: "new", specs: "s1" } });
    },
  );

  it("never resumes another account's round", async () => {
    mocks.userId = "me";
    localStorage.setItem(
      DAILY_PRACTICE_STORAGE_KEY,
      JSON.stringify({ guest: { cover: "g1" }, other: { cover: "o1" } }),
    );
    const play = vi.spyOn(DailyService, "dailyControllerPlayPracticeV1");
    vi.spyOn(DailyService, "dailyControllerStartPracticeV1").mockResolvedValue(
      round("m1"),
    );
    const { result } = renderPractice();

    await waitFor(() => expect(result.current.data?.roundId).toBe("m1"));
    expect(play).not.toHaveBeenCalled();
    expect(storedRounds()).toEqual({
      guest: { cover: "g1" },
      other: { cover: "o1" },
      me: { cover: "m1" },
    });
  });

  it("sends the whole guess list and restarts with a new stored round", async () => {
    vi.spyOn(DailyService, "dailyControllerStartPracticeV1")
      .mockResolvedValueOnce(round("r1"))
      .mockResolvedValueOnce(round("r2"));
    const play = vi
      .spyOn(DailyService, "dailyControllerPlayPracticeV1")
      .mockResolvedValue(
        round("r1", {
          attempts: 1,
          status: DailyPracticePlayResponseDto.status.WON,
          feedback: [{ gameId: 5 } as never],
        }),
      );
    const client = createTestQueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderPractice(client);
    await waitFor(() => expect(result.current.data?.roundId).toBe("r1"));

    act(() => result.current.guess(5));
    await waitFor(() => expect(result.current.data?.status).toBe("won"));
    expect(play).toHaveBeenCalledWith("r1", { guesses: [5], hintAt: null });

    act(() => result.current.restart());
    await waitFor(() => expect(result.current.data?.roundId).toBe("r2"));
    expect(storedRounds()).toEqual({ guest: { cover: "r2" } });
    expect(invalidate).not.toHaveBeenCalled();
    expect(localStorage.getItem("gamenode-daily-results")).toBeNull();
  });
});

describe("DailyPracticeView", () => {
  it("offers Play again once the round is finished", async () => {
    vi.spyOn(DailyService, "dailyControllerStartPracticeV1")
      .mockResolvedValueOnce(
        round("r1", {
          attempts: 6,
          status: DailyPracticePlayResponseDto.status.LOST,
          answer: { gameId: 9, name: "The answer" } as never,
        }),
      )
      .mockResolvedValueOnce(round("r2"));
    renderDaily(<DailyPracticeView mode={"cover"} />);

    expect(await screen.findByText("daily.practice.cover.title")).toBeTruthy();
    expect(screen.getByText("daily.practice.noLimit")).toBeTruthy();
    expect(
      screen
        .getByText("daily.result.backToHub")
        .closest("a")
        ?.getAttribute("href"),
    ).toBe("/daily");

    fireEvent.click(screen.getByText("daily.practice.playAgain"));
    await waitFor(() =>
      expect(screen.queryByText("daily.practice.playAgain")).toBeNull(),
    );
    expect(storedRounds()).toEqual({ guest: { cover: "r2" } });
    expect(localStorage.getItem("gamenode-daily-results")).toBeNull();
  });

  it.each([
    [429, "rateLimited"],
    [503, "unavailable"],
  ])("explains a %s and retries", async (status, key) => {
    const start = vi
      .spyOn(DailyService, "dailyControllerStartPracticeV1")
      .mockRejectedValueOnce(apiError(status))
      .mockResolvedValueOnce(round("r1"));
    renderDaily(<DailyPracticeView mode={"cover"} />);

    expect(await screen.findByText(`daily.practice.${key}.title`)).toBeTruthy();
    expect(screen.getByText(`daily.practice.${key}.description`)).toBeTruthy();

    fireEvent.click(screen.getByText("actions.retry"));
    expect(await screen.findByText("daily.practice.cover.title")).toBeTruthy();
    expect(start).toHaveBeenCalledTimes(2);
  });
});
