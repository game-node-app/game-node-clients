// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WrappedRecapScreen } from "../../../../../packages/ui/src/components/wrapped/WrappedRecapScreen";
import { getRecapPreviewScale } from "../../../../../packages/ui/src/components/wrapped/card/recapCardFormats";

const mocks = vi.hoisted(() => ({
  summary: undefined as unknown,
  summaryPeriods: [] as string[],
  cards: [] as { template: string; format: string; summary: unknown }[],
  toBlob: vi.fn(),
  toPng: vi.fn(),
  exportVideo: vi.fn(),
  notifyError: vi.fn(),
  downloads: [] as string[],
  videoSupported: true,
  useSupporterStatus: vi.fn(),
  useSupporterEntryHref: vi.fn(),
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

vi.mock("html-to-image", () => ({
  toBlob: mocks.toBlob,
  toPng: mocks.toPng,
}));

vi.mock("../../../../../packages/ui/src/components", () => ({
  CenteredLoading: () => <div data-testid={"loading"} />,
  DetailsBox: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TextLink: ({ children }: { children: React.ReactNode }) => (
    <a href={"/x"}>{children}</a>
  ),
  useUserId: () => "user-1",
  useUserProfile: () => ({ data: { username: "Tester" } }),
  useGames: () => ({ data: [], isLoading: false }),
}));

// The recap exports video for every account: it must not read the supporter
// subscription or link to the Supporter upsell. These stay mocked so a
// reintroduced dependency fails loudly instead of triggering real queries.
vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterStatus",
  () => ({ useSupporterStatus: mocks.useSupporterStatus }),
);
vi.mock(
  "../../../../../packages/ui/src/components/supporter/util/useSupporterEntryHref",
  () => ({ useSupporterEntryHref: mocks.useSupporterEntryHref }),
);

vi.mock("../../../../../packages/ui/src/util", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../../packages/ui/src/util")
    >();
  return { ...actual, createErrorNotification: mocks.notifyError };
});

vi.mock(
  "../../../../../packages/ui/src/components/wrapped/hooks/useRecapSummary",
  () => ({
    useRecapSummary: (period: string) => {
      mocks.summaryPeriods.push(period);
      return { data: mocks.summary, isLoading: false };
    },
  }),
);

// Fonts, rasterization and the H.264 encoder are expensive boundaries: the
// screen tests only check which export each action dispatches.
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCardFonts",
  () => ({
    RecapCardFonts: () => null,
    loadRecapFonts: vi.fn(async () => {}),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/wrapped/util/exportRecapVideo",
  () => ({
    RECAP_VIDEO_MAX_SECONDS: 15,
    isRecapVideoSupported: () => mocks.videoSupported,
    exportRecapVideo: mocks.exportVideo,
  }),
);

// The preview only adds scaling (covered by `getRecapPreviewScale`), and the
// templates need avatars and profile queries that are not under test here.
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCardPreview",
  () => ({
    RecapCardPreview: ({
      cardRef,
      children,
    }: {
      cardRef: React.RefObject<HTMLDivElement>;
      children: React.ReactNode;
    }) => <div ref={cardRef}>{children}</div>,
  }),
);

// Each template records the shared summary it is rendered with, so the screen
// tests can check the selection without duplicating the card tests.
interface CardMockProps {
  format: string;
  summary: unknown;
}

vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapSummaryCard",
  () => ({
    RecapSummaryCard: ({ format, summary }: CardMockProps) => {
      mocks.cards.push({ template: "summary", format, summary });
      return <div data-testid={"recap-summary-card"}>{format}</div>;
    },
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapPosterCard",
  () => ({
    RecapPosterCard: ({ format, summary }: CardMockProps) => {
      mocks.cards.push({ template: "poster", format, summary });
      return <div data-testid={"recap-poster-card"}>{format}</div>;
    },
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapDashCard",
  () => ({
    RecapDashCard: ({ format, summary }: CardMockProps) => {
      mocks.cards.push({ template: "dash", format, summary });
      return <div data-testid={"recap-dash-card"}>{format}</div>;
    },
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapBentoCard",
  () => ({
    RecapBentoCard: ({ format, summary }: CardMockProps) => {
      mocks.cards.push({ template: "bento", format, summary });
      return <div data-testid={"recap-bento-card"}>{format}</div>;
    },
  }),
);

const summary = (seconds: number) => ({
  period: "week",
  current: { totalPlaytimeSeconds: seconds, totalGames: seconds > 0 ? 2 : 0 },
  previous: { totalPlaytimeSeconds: 3600, totalGames: 1 },
  topGames: [],
  topGenre: null,
  topPlatform: null,
  playedInPeriod: 0,
  finishedInPeriod: 0,
  reviewedInPeriod: 0,
});

const clipFile = () => new File(["clip"], "clip.mp4", { type: "video/mp4" });

const exportedVideo = () =>
  new File(["video"], "gamenode-recap-1.mp4", { type: "video/mp4" });

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const shareButton = (key: string) =>
  screen.getByRole("button", { name: `mobile.wrapped.buttons.${key}` });

const downloadButton = (key: string) =>
  screen.getByRole("button", { name: `mobile.wrapped.buttons.${key}` });

/** Covers both `disabled` and any disabled wrapper (fieldset/aria). */
const isControlDisabled = (element: HTMLElement) =>
  (element as HTMLButtonElement).disabled ||
  element.getAttribute("aria-disabled") === "true" ||
  !!element.closest("fieldset[disabled]");

function renderScreen(onShare = vi.fn(async () => {})) {
  render(
    <MantineProvider>
      <QueryClientProvider client={new QueryClient()}>
        <WrappedRecapScreen onShare={onShare} />
      </QueryClientProvider>
    </MantineProvider>,
  );
  return onShare;
}

const clickShare = async (key = "shareImage") => {
  await act(async () => {
    fireEvent.click(shareButton(key));
  });
};

const clickDownload = async (key = "downloadImage") => {
  await act(async () => {
    fireEvent.click(downloadButton(key));
  });
};

const selectBackground = (background: "art" | "photo" | "video") => {
  fireEvent.click(
    screen.getByRole("radio", {
      name: `mobile.wrapped.background.${background}`,
    }),
  );
};

const chooseClip = () => {
  // The clip picker lives in the video choice of the background control.
  selectBackground("video");
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("The clip picker was not rendered.");
  fireEvent.change(input, { target: { files: [clipFile()] } });
};

const clickFormat = (format: "story" | "feed") => {
  fireEvent.click(screen.getByLabelText(`mobile.wrapped.formats.${format}`));
};

beforeEach(() => {
  mocks.summary = summary(7200);
  mocks.summaryPeriods = [];
  mocks.cards = [];
  mocks.toBlob.mockReset();
  mocks.toBlob.mockResolvedValue(new Blob(["x"], { type: "image/jpeg" }));
  mocks.toPng.mockReset();
  mocks.toPng.mockResolvedValue("data:image/png;base64,overlay");
  mocks.exportVideo.mockReset();
  mocks.exportVideo.mockResolvedValue(exportedVideo());
  mocks.notifyError.mockReset();
  mocks.downloads = [];
  mocks.videoSupported = true;
  mocks.useSupporterStatus.mockReset();
  mocks.useSupporterStatus.mockReturnValue({ data: { isSupporter: false } });
  mocks.useSupporterEntryHref.mockReset();
  mocks.useSupporterEntryHref.mockReturnValue("/supporter");

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
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:clip"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
  // `loadImage` only needs to resolve; the encoder is mocked.
  Object.defineProperty(globalThis, "Image", {
    configurable: true,
    writable: true,
    value: class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        this.onload?.();
      }
    },
  });

  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    mocks.downloads.push(this.download);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("getRecapPreviewScale", () => {
  it("fits the card to the container width", () => {
    expect(getRecapPreviewScale(540, "feed")).toBeCloseTo(540 / 1600);
  });

  it("limits the height so a Story card does not take the whole page", () => {
    expect(getRecapPreviewScale(1500, "story")).toBeCloseTo(720 / 1920);
  });

  it("never scales the card up", () => {
    expect(getRecapPreviewScale(5000, "feed", 5000)).toBe(1);
  });

  it("does not scale before the container is measured", () => {
    expect(getRecapPreviewScale(0, "story")).toBe(1);
  });
});

describe("WrappedRecapScreen", () => {
  it("starts on the Poster template of the week summary", () => {
    renderScreen();

    expect(screen.getByTestId("recap-poster-card").textContent).toBe("story");
    expect(mocks.summaryPeriods.at(-1)).toBe("week");
    expect(mocks.cards.at(-1)).toMatchObject({
      template: "poster",
      summary: mocks.summary,
    });
  });

  it("loads the summary again when another period is picked", () => {
    renderScreen();

    fireEvent.click(screen.getByLabelText("explore.periods.month"));

    expect(mocks.summaryPeriods.at(-1)).toBe("month");
  });

  it("offers only Poster, Dash and Bento templates in Story", () => {
    renderScreen();

    expect(
      screen.getByLabelText("mobile.wrapped.templates.poster"),
    ).toBeTruthy();
    expect(screen.getByLabelText("mobile.wrapped.templates.dash")).toBeTruthy();
    expect(
      screen.getByLabelText("mobile.wrapped.templates.bento"),
    ).toBeTruthy();

    // The recap has a single data source: no cover grid template or summary
    // template is offered in the Story format.
    expect(
      screen.queryByLabelText("mobile.wrapped.templates.covers"),
    ).toBeNull();
    expect(
      screen.queryByLabelText("mobile.wrapped.templates.summary"),
    ).toBeNull();

    // And none of the cover grid controls remain.
    for (const key of [
      "gridStyle",
      "excludedGames",
      "excludedGamesHint",
      "withRecentPlaytime",
      "withTotalPlaytime",
      "withPlatform",
    ]) {
      expect(screen.queryByText(`mobile.wrapped.labels.${key}`)).toBeNull();
    }
  });

  it("switches between the Story templates and keeps the summary", () => {
    renderScreen();

    fireEvent.click(screen.getByLabelText("mobile.wrapped.templates.dash"));
    expect(screen.getByTestId("recap-dash-card").textContent).toBe("story");
    expect(screen.queryByTestId("recap-poster-card")).toBeNull();

    fireEvent.click(screen.getByLabelText("mobile.wrapped.templates.bento"));
    expect(screen.getByTestId("recap-bento-card").textContent).toBe("story");

    expect(screen.queryByTestId("recap-summary-card")).toBeNull();
    expect(mocks.cards.at(-1)?.summary).toBe(mocks.summary);
  });

  it("uses the summary for Feed and never offers Covers in either format", () => {
    renderScreen();

    clickFormat("feed");

    expect(screen.getByTestId("recap-summary-card").textContent).toBe("feed");
    expect(mocks.cards.at(-1)?.summary).toBe(mocks.summary);
    expect(
      screen.queryByLabelText("mobile.wrapped.templates.covers"),
    ).toBeNull();
    expect(screen.queryByText("mobile.wrapped.templates.covers")).toBeNull();
    // The Story templates belong to the vertical format.
    expect(
      screen.queryByLabelText("mobile.wrapped.templates.poster"),
    ).toBeNull();
    expect(screen.queryByLabelText("mobile.wrapped.templates.dash")).toBeNull();
    expect(
      screen.queryByLabelText("mobile.wrapped.templates.bento"),
    ).toBeNull();

    clickFormat("story");

    expect(screen.queryByTestId("recap-summary-card")).toBeNull();
    expect(
      screen.queryByLabelText("mobile.wrapped.templates.covers"),
    ).toBeNull();
  });

  it("falls back to Poster when Feed is changed back to Story", () => {
    renderScreen();

    fireEvent.click(screen.getByLabelText("mobile.wrapped.templates.bento"));
    expect(screen.getByTestId("recap-bento-card")).toBeTruthy();

    clickFormat("feed");
    expect(screen.getByTestId("recap-summary-card")).toBeTruthy();
    expect(screen.queryByTestId("recap-bento-card")).toBeNull();

    clickFormat("story");
    expect(screen.getByTestId("recap-poster-card")).toBeTruthy();
    expect(screen.queryByTestId("recap-summary-card")).toBeNull();
  });

  it("shares the image when no clip is loaded", async () => {
    const onShare = renderScreen();

    expect(shareButton("shareImage")).toBeTruthy();
    expect(downloadButton("downloadImage")).toBeTruthy();

    await clickShare();

    await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
    expect(mocks.toBlob).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1080, height: 1920, pixelRatio: 1 }),
    );
    const file = (onShare.mock.calls[0] as unknown as [File])[0];
    expect(file).toBeInstanceOf(File);
    expect(file.name).toMatch(/^gamenode-recap-\d+\.jpeg$/);
    expect(file.type).toBe("image/jpeg");
    expect(mocks.exportVideo).not.toHaveBeenCalled();
  });

  it("downloads the image without sharing it", async () => {
    const onShare = renderScreen();

    await clickDownload();

    await waitFor(() => expect(mocks.downloads).toHaveLength(1));
    expect(mocks.downloads[0]).toMatch(/^gamenode-recap-\d+\.jpeg$/);
    expect(onShare).not.toHaveBeenCalled();
    expect(mocks.toBlob).toHaveBeenCalledTimes(1);
  });

  it("exports at the Feed size when Feed is selected", async () => {
    renderScreen();

    clickFormat("feed");
    await clickShare();

    await waitFor(() => expect(mocks.toBlob).toHaveBeenCalledTimes(1));
    expect(mocks.toBlob).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1600, height: 900, pixelRatio: 1 }),
    );
  });

  it("shares the video when an ordinary account has a clip on the Story Poster", async () => {
    const onShare = renderScreen();

    chooseClip();
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());
    expect(downloadButton("downloadVideo")).toBeTruthy();
    // A single primary share and secondary download, with no Generate step.
    expect(
      screen.getAllByRole("button", {
        name: /mobile\.wrapped\.buttons\.share/,
      }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", {
        name: /mobile\.wrapped\.buttons\.download/,
      }),
    ).toHaveLength(1);
    expect(screen.queryByText("mobile.wrapped.video.generate")).toBeNull();
    expect(screen.queryByRole("button", { name: /generate/i })).toBeNull();

    await clickShare("shareVideo");

    await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
    expect(mocks.exportVideo).toHaveBeenCalledTimes(1);
    const options = mocks.exportVideo.mock.calls[0][0] as {
      file: File;
      overlay: unknown;
      format: string;
      hero: { width: number; height: number };
    };
    expect(options.file.name).toBe("clip.mp4");
    expect(options.file.type).toBe("video/mp4");
    // The Poster's clip fills the top of the 1080x1920 card.
    expect(options.format).toBe("story");
    expect(options.hero).toMatchObject({ width: 1080, height: 1300 });
    expect(mocks.toPng).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1080, height: 1920, pixelRatio: 1 }),
    );
    expect(mocks.toBlob).not.toHaveBeenCalled();

    const file = (onShare.mock.calls[0] as unknown as [File])[0];
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("gamenode-recap-1.mp4");
    expect(file.type).toBe("video/mp4");
  });

  it("downloads the video without sharing it", async () => {
    const onShare = renderScreen();

    chooseClip();
    await waitFor(() => expect(downloadButton("downloadVideo")).toBeTruthy());

    await clickDownload("downloadVideo");

    await waitFor(() => expect(mocks.downloads).toHaveLength(1));
    expect(mocks.downloads[0]).toBe("gamenode-recap-1.mp4");
    expect(mocks.exportVideo).toHaveBeenCalledTimes(1);
    expect(onShare).not.toHaveBeenCalled();
  });

  it("keeps the video on every template and format", async () => {
    const onShare = renderScreen();

    chooseClip();
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());

    fireEvent.click(screen.getByLabelText("mobile.wrapped.templates.dash"));
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());

    fireEvent.click(screen.getByLabelText("mobile.wrapped.templates.bento"));
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());

    // The Feed card is exported as a video at its own size and media area.
    clickFormat("feed");
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());
    await clickShare("shareVideo");
    await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
    expect(mocks.toBlob).not.toHaveBeenCalled();
    expect(mocks.toPng).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1600, height: 900 }),
    );
    expect(mocks.exportVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "feed",
        hero: expect.objectContaining({ width: 1600, height: 900 }),
      }),
    );
  });

  it("returns to the image after the clip is removed", async () => {
    const onShare = renderScreen();

    chooseClip();
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());

    fireEvent.click(
      screen.getByRole("button", { name: "mobile.wrapped.video.remove" }),
    );
    await waitFor(() => expect(shareButton("shareImage")).toBeTruthy());

    await clickShare("shareImage");

    await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
    expect((onShare.mock.calls[0] as unknown as [File])[0].type).toBe(
      "image/jpeg",
    );
    expect(mocks.exportVideo).not.toHaveBeenCalled();
  });

  it("offers the video to an ordinary account with no supporter upsell", async () => {
    const onShare = renderScreen();

    // The picker is available without an entitlement: no lock and no upsell.
    selectBackground("video");
    expect(
      screen.getByRole("button", { name: /mobile\.wrapped\.video\.pick/ }),
    ).toBeTruthy();
    expect(
      screen.queryByText(/mobile\.wrapped\.video\.premiumOnly/),
    ).toBeNull();
    expect(
      screen.queryByText(/mobile\.wrapped\.video\.becomeSupporter/),
    ).toBeNull();
    expect(
      screen.queryByRole("link", {
        name: /mobile\.wrapped\.video\.becomeSupporter/,
      }),
    ).toBeNull();

    chooseClip();
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());
    await clickShare("shareVideo");

    await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
    expect(mocks.exportVideo).toHaveBeenCalledTimes(1);
    expect((onShare.mock.calls[0] as unknown as [File])[0].type).toBe(
      "video/mp4",
    );
    expect(mocks.useSupporterStatus).not.toHaveBeenCalled();
    expect(mocks.useSupporterEntryHref).not.toHaveBeenCalled();
  });

  it("does not depend on the supporter subscription for the recap", () => {
    renderScreen();

    expect(mocks.useSupporterStatus).not.toHaveBeenCalled();
    expect(mocks.useSupporterEntryHref).not.toHaveBeenCalled();
  });

  it("uses the image when the browser cannot encode video", async () => {
    mocks.videoSupported = false;
    renderScreen();

    expect(shareButton("shareImage")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /shareVideo/ })).toBeNull();
    selectBackground("video");
    expect(screen.getByText("mobile.wrapped.video.unsupported")).toBeTruthy();
  });

  it("locks both actions and the preview while the image is being prepared", async () => {
    const pending = deferred<void>();
    const onShare = vi.fn(() => pending.promise);
    renderScreen(onShare);
    const user = userEvent.setup();

    await user.click(shareButton("shareImage"));
    await waitFor(() =>
      expect(document.body.textContent).toContain(
        "mobile.wrapped.buttons.preparingImage",
      ),
    );

    expect(isControlDisabled(shareButton("shareImage"))).toBe(true);
    expect(isControlDisabled(downloadButton("downloadImage"))).toBe(true);
    expect(
      isControlDisabled(
        screen.getByRole("radio", { name: "mobile.wrapped.formats.feed" }),
      ),
    ).toBe(true);
    expect(
      isControlDisabled(
        screen.getByRole("radio", { name: "mobile.wrapped.templates.dash" }),
      ),
    ).toBe(true);
    expect(
      isControlDisabled(screen.getByLabelText("explore.periods.month")),
    ).toBe(true);
    expect(isControlDisabled(screen.getByTestId("recap-accent-teal"))).toBe(
      true,
    );

    // A second click on either action must not start another export.
    await user.click(downloadButton("downloadImage")).catch(() => {});
    await user.click(shareButton("shareImage")).catch(() => {});
    await user
      .click(screen.getByRole("radio", { name: "mobile.wrapped.formats.feed" }))
      .catch(() => {});

    expect(mocks.toBlob).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(mocks.downloads).toHaveLength(0);
    expect(screen.getByTestId("recap-poster-card").textContent).toBe("story");

    pending.resolve();
    await waitFor(() =>
      expect(isControlDisabled(shareButton("shareImage"))).toBe(false),
    );
    expect(document.body.textContent).not.toContain(
      "mobile.wrapped.buttons.preparingImage",
    );
  });

  it("reports the integer video progress and locks both actions while preparing", async () => {
    const pending = deferred<File>();
    mocks.exportVideo.mockImplementationOnce(
      async ({ onProgress }: { onProgress?: (progress: number) => void }) => {
        onProgress?.(0.426);
        return pending.promise;
      },
    );
    renderScreen();
    const user = userEvent.setup();

    chooseClip();
    await waitFor(() => expect(shareButton("shareVideo")).toBeTruthy());
    await user.click(shareButton("shareVideo"));

    await waitFor(() =>
      expect(document.body.textContent).toContain(
        'mobile.wrapped.buttons.preparingVideo:{"progress":43}',
      ),
    );
    expect(isControlDisabled(shareButton("shareVideo"))).toBe(true);
    expect(isControlDisabled(downloadButton("downloadVideo"))).toBe(true);
    expect(
      isControlDisabled(
        screen.getByRole("radio", { name: "mobile.wrapped.formats.feed" }),
      ),
    ).toBe(true);
    expect(
      isControlDisabled(
        screen.getByRole("radio", { name: "mobile.wrapped.templates.dash" }),
      ),
    ).toBe(true);
    expect(
      isControlDisabled(
        screen.getByRole("button", { name: "mobile.wrapped.media.replace" }),
      ),
    ).toBe(true);
    expect(
      isControlDisabled(
        screen.getByRole("button", { name: "mobile.wrapped.video.remove" }),
      ),
    ).toBe(true);

    await user.click(downloadButton("downloadVideo")).catch(() => {});
    await user.click(shareButton("shareVideo")).catch(() => {});

    expect(mocks.exportVideo).toHaveBeenCalledTimes(1);
    expect(mocks.toBlob).not.toHaveBeenCalled();
    expect(mocks.downloads).toHaveLength(0);
    expect(document.body.textContent).not.toContain(
      "mobile.wrapped.buttons.preparingImage",
    );

    pending.resolve(exportedVideo());
    await waitFor(() =>
      expect(isControlDisabled(shareButton("shareVideo"))).toBe(false),
    );
  });

  it("reports an error and keeps the page when sharing fails", async () => {
    const failure = new Error("share unavailable");
    const onShare = vi.fn(async () => {
      throw failure;
    });
    renderScreen(onShare);

    await clickShare();

    await waitFor(() => expect(mocks.notifyError).toHaveBeenCalled());
    expect(mocks.notifyError.mock.calls[0][0]).toBe(failure);
    expect(screen.getByTestId("recap-poster-card")).toBeTruthy();
  });

  it("explains an empty period and disables sharing", () => {
    mocks.summary = summary(0);
    renderScreen();

    expect(
      screen.getByText(/mobile\.wrapped\.messages\.noPlaytime/),
    ).toBeTruthy();
    expect(isControlDisabled(shareButton("shareImage"))).toBe(true);
    expect(isControlDisabled(downloadButton("downloadImage"))).toBe(true);
  });
});
