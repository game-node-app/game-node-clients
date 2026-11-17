import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import {
  DailyPlayResponseDto,
  DailyPuzzleDto,
  type DailyTodayResponseDto,
} from "@repo/wrapper/server";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

setProjectContext({
  client: "web",
  s3BucketUrl: "http://s3.test",
  serverUrl: "http://server.test",
  searchUrl: "http://search.test",
});

/** Mantine reads media queries; jsdom has none. */
export function stubMatchMedia() {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList;
}

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });

export function renderDaily(
  ui: React.ReactElement,
  client: QueryClient = createTestQueryClient(),
): RenderResult & { client: QueryClient } {
  const router = {
    back: () => {},
    pathname: "",
    push: async () => {},
    query: new URLSearchParams(),
  };
  const result = render(
    <QueryClientProvider client={client}>
      <MantineProvider>
        <UIProvider
          presenters={{
            Link: ({ href, children, ...others }) => (
              <a href={href} {...others}>
                {children}
              </a>
            ),
          }}
          hooks={{ useRouter: () => router }}
        >
          {ui}
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>,
  );
  return { ...result, client };
}

export const TEST_TODAY = "2026-11-17";

export const todayResponse = (
  overrides: Partial<DailyTodayResponseDto> = {},
): DailyTodayResponseDto => ({
  date: TEST_TODAY,
  nextResetAt: "2026-11-18T03:00:00.000Z",
  weekly: null,
  puzzles: Object.values(DailyPuzzleDto.mode).map((mode, index) => ({
    id: index + 1,
    number: 40,
    date: TEST_TODAY,
    mode,
    maxAttempts: mode === "specs" ? 10 : 6,
  })) as DailyPuzzleDto[],
  ...overrides,
});

export const playResponse = (
  overrides: Partial<DailyPlayResponseDto> = {},
): DailyPlayResponseDto => ({
  puzzleId: 1,
  number: 40,
  date: TEST_TODAY,
  mode: DailyPlayResponseDto.mode.COVER,
  maxAttempts: 6,
  attempts: 0,
  status: DailyPlayResponseDto.status.IN_PROGRESS,
  feedback: [],
  hints: { imageTokens: ["token-1"], keywords: [] },
  hintAvailable: false,
  hintAt: null,
  ...overrides,
});
