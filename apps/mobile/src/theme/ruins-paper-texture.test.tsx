// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RUINS_PREFERENCES_STORAGE_KEY } from "../../../../packages/ui/src/theme/ruins/preferences";
import { RuinsPaperTexture } from "../../../../packages/ui/src/theme/themes/ruins/screens/overlay/RuinsPaperTexture";
import { RuinsScanline } from "../../../../packages/ui/src/theme/themes/ruins/screens/overlay/RuinsScanline";

const TEXTURE = '[data-slot="ruins-paper-texture"]';
const SCANLINE = '[data-slot="ruins-scanline"]';

beforeEach(() => {
  localStorage.clear();
  // Same-tab writes do not fire `storage`; force the store to re-read.
  window.dispatchEvent(new StorageEvent("storage", { key: null }));
});

afterEach(cleanup);

function setPreferences(value: Record<string, unknown>) {
  localStorage.setItem(RUINS_PREFERENCES_STORAGE_KEY, JSON.stringify(value));
  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
  });
}

describe("RuinsPaperTexture", () => {
  it("renders a decorative, non-interactive layer by default", () => {
    const { container } = render(<RuinsPaperTexture />);
    const layer = container.querySelector(TEXTURE);
    expect(layer).not.toBeNull();
    expect(layer?.getAttribute("aria-hidden")).toBe("true");
  });

  it("hides when the option is off and returns when it is on", () => {
    const { container } = render(<RuinsPaperTexture />);
    setPreferences({ paperTexture: false });
    expect(container.querySelector(TEXTURE)).toBeNull();

    setPreferences({ paperTexture: true });
    expect(container.querySelector(TEXTURE)).not.toBeNull();
  });
});

describe("RuinsScanline", () => {
  it("only shows while a query is in flight and the option is on", async () => {
    const queryClient = new QueryClient();
    setPreferences({ scanline: true });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <RuinsScanline />
      </QueryClientProvider>,
    );
    expect(container.querySelector(SCANLINE)).toBeNull();

    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let fetching: Promise<unknown> = Promise.resolve();
    await act(async () => {
      fetching = queryClient.fetchQuery({
        queryKey: ["slow"],
        queryFn: () => pending.then(() => "done"),
      });
    });
    await waitFor(() =>
      expect(container.querySelector(SCANLINE)).not.toBeNull(),
    );

    await act(async () => {
      release();
      await fetching;
    });
    await waitFor(() => expect(container.querySelector(SCANLINE)).toBeNull());

    setPreferences({ scanline: false });
    await act(async () => {
      fetching = queryClient.fetchQuery({
        queryKey: ["slow-2"],
        queryFn: () => pending.then(() => "done"),
      });
      await fetching;
    });
    expect(container.querySelector(SCANLINE)).toBeNull();
  });
});
