// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, RecapService } from "@repo/wrapper/server";
import { RecapGoalCard } from "../../../../../packages/ui/src/components/recap/goal/RecapGoalCard";
import {
  createRecapGoalFormSchema,
  getInitialRecapGoalTarget,
  isRecapGoalYearAccepted,
} from "../../../../../packages/ui/src/components/recap/goal/recapGoal";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

const currentYear = new Date().getUTCFullYear();
// The goal is year + 1, so this Recap's goal is the current UTC year.
const recapYear = currentYear - 1;
const goalYear = recapYear + 1;

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/recap/goals",
      body: { message: `goal error ${status}` },
      ok: false,
    },
    `goal error ${status}`,
  );
}

function renderCard(
  props: Partial<React.ComponentProps<typeof RecapGoalCard>> = {},
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <RecapGoalCard
          year={recapYear}
          userId={"user-1"}
          finishedGames={14}
          {...props}
        />
      </QueryClientProvider>
    </MantineProvider>,
  );
}

const getGoalInput = () => screen.getByRole("textbox") as HTMLInputElement;

const saveButton = () =>
  screen.getByRole("button", { name: "recap.goal.save" });

beforeEach(() => {
  session.userId = "user-1";
  vi.clearAllMocks();

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    writable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.userId = undefined;
});

describe("Recap goal rules", () => {
  it("only accepts the current UTC year or the next one", () => {
    const now = new Date("2026-07-01T00:00:00.000Z");

    expect(isRecapGoalYearAccepted(2026, now)).toBe(true);
    expect(isRecapGoalYearAccepted(2027, now)).toBe(true);
    expect(isRecapGoalYearAccepted(2025, now)).toBe(false);
    expect(isRecapGoalYearAccepted(2028, now)).toBe(false);
  });

  it("starts from the saved target or from finished games + 4", () => {
    expect(getInitialRecapGoalTarget(null, 14)).toBe(18);
    expect(getInitialRecapGoalTarget(undefined, 14)).toBe(18);
    expect(getInitialRecapGoalTarget(20, 14)).toBe(20);
    expect(getInitialRecapGoalTarget(null, 997)).toBe(999);
  });

  it("validates a whole number between 1 and 999", () => {
    const t = ((key: string) => key) as unknown as Parameters<
      typeof createRecapGoalFormSchema
    >[0];
    const schema = createRecapGoalFormSchema(t);

    expect(schema.safeParse({ target: 1 }).success).toBe(true);
    expect(schema.safeParse({ target: 999 }).success).toBe(true);
    expect(schema.safeParse({ target: 0 }).success).toBe(false);
    expect(schema.safeParse({ target: 1000 }).success).toBe(false);
    expect(schema.safeParse({ target: 18.5 }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });
});

describe("RecapGoalCard", () => {
  it("suggests four more finished games when there is no goal", async () => {
    const getGoal = vi
      .spyOn(RecapService, "recapControllerGetGoalV1")
      .mockResolvedValue({ year: goalYear, target: null, finished: 0 });

    renderCard();

    const input = (await screen.findByRole("textbox")) as HTMLInputElement;
    expect(input.value).toBe("18");
    expect(getGoal).toHaveBeenCalledWith(goalYear);
    expect(
      screen.getByText(
        `recap.goal.title:${JSON.stringify({ year: goalYear })}`,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        `recap.goal.suggestion:${JSON.stringify({
          target: 18,
          difference: 4,
          year: recapYear,
        })}`,
      ),
    ).toBeTruthy();
  });

  it("starts from an existing goal and shows its progress", async () => {
    vi.spyOn(RecapService, "recapControllerGetGoalV1").mockResolvedValue({
      year: goalYear,
      target: 20,
      finished: 3,
    });

    renderCard();

    const input = (await screen.findByRole("textbox")) as HTMLInputElement;
    expect(input.value).toBe("20");
    expect(
      screen.getByText(
        `recap.goal.progress:${JSON.stringify({ finished: 3, target: 20 })}`,
      ),
    ).toBeTruthy();
  });

  it("does not show or read the goal for a visitor", () => {
    session.userId = undefined;
    const getGoal = vi.spyOn(RecapService, "recapControllerGetGoalV1");

    renderCard();

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByText(/recap\.goal\.title/)).toBeNull();
    expect(getGoal).not.toHaveBeenCalled();
  });

  it("does not show or read the goal on another user's Recap", () => {
    const getGoal = vi.spyOn(RecapService, "recapControllerGetGoalV1");

    renderCard({ userId: "user-2" });

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByText(/recap\.goal\.title/)).toBeNull();
    expect(getGoal).not.toHaveBeenCalled();
  });

  it("does not show or read the goal for an old Recap", () => {
    const getGoal = vi.spyOn(RecapService, "recapControllerGetGoalV1");

    renderCard({ year: currentYear - 3 });

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByText(/recap\.goal\.title/)).toBeNull();
    expect(getGoal).not.toHaveBeenCalled();
  });

  it("saves the goal, stores the response and confirms the reminder", async () => {
    vi.spyOn(RecapService, "recapControllerGetGoalV1").mockResolvedValue({
      year: goalYear,
      target: null,
      finished: 0,
    });
    const setGoal = vi
      .spyOn(RecapService, "recapControllerSetGoalV1")
      .mockResolvedValue({ year: goalYear, target: 18, finished: 0 });

    renderCard({ finishedGames: 10 });

    const input = (await screen.findByRole("textbox")) as HTMLInputElement;
    expect(input.value).toBe("14");

    await act(async () => {
      fireEvent.change(input, { target: { value: "18" } });
      fireEvent.click(saveButton());
    });

    await waitFor(() =>
      expect(setGoal).toHaveBeenCalledWith(goalYear, { target: 18 }),
    );
    expect(await screen.findByText("recap.goal.saved")).toBeTruthy();
    expect(
      await screen.findByText(
        `recap.goal.progress:${JSON.stringify({ finished: 0, target: 18 })}`,
      ),
    ).toBeTruthy();
  });

  it("keeps the previous saved goal and notifies when saving fails", async () => {
    vi.spyOn(RecapService, "recapControllerGetGoalV1").mockResolvedValue({
      year: goalYear,
      target: 12,
      finished: 0,
    });
    vi.spyOn(RecapService, "recapControllerSetGoalV1").mockRejectedValue(
      apiError(400),
    );

    renderCard();

    const input = (await screen.findByRole("textbox")) as HTMLInputElement;
    expect(input.value).toBe("12");

    await act(async () => {
      fireEvent.change(input, { target: { value: "18" } });
      fireEvent.click(saveButton());
    });

    await waitFor(() => expect(getGoalInput().value).toBe("12"));
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" }),
    );
    expect(screen.queryByText("recap.goal.saved")).toBeNull();
  });
});
