// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DailyShareButton } from "../../../../../packages/ui/src/components/daily/result/DailyShareButton";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }) as unknown as MediaQueryList;

const mockClipboard = (writeText: () => unknown) =>
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });

const entries = [
  {
    modeLabel: "Cover",
    number: 7,
    maxAttempts: 6,
    results: ["wrong", "correct"],
  },
];

const renderButton = (shareText: (text: string) => Promise<boolean>) =>
  render(
    <MantineProvider>
      <UIProvider
        hooks={{
          useRouter: () => ({
            back: () => {},
            pathname: "",
            push: async () => {},
            query: new URLSearchParams(),
          }),
          shareText,
        }}
      >
        <DailyShareButton entries={entries} />
      </UIProvider>
    </MantineProvider>,
  );

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("shares through the app's share sheet", async () => {
  const shareText = vi.fn().mockResolvedValue(true);
  const writeText = vi.fn();
  mockClipboard(writeText);
  renderButton(shareText);

  fireEvent.click(screen.getByRole("button"));

  await vi.waitFor(() => expect(shareText).toHaveBeenCalledOnce());
  expect(shareText.mock.calls[0][0]).toContain("Cover #7");
  expect(writeText).not.toHaveBeenCalled();
});

it("does not copy when the share sheet is dismissed", async () => {
  const shareText = vi.fn().mockResolvedValue(false);
  const writeText = vi.fn();
  mockClipboard(writeText);
  renderButton(shareText);

  fireEvent.click(screen.getByRole("button"));

  await vi.waitFor(() => expect(shareText).toHaveBeenCalledOnce());
  expect(writeText).not.toHaveBeenCalled();
});

it("copies to the clipboard when sharing is unavailable", async () => {
  const shareText = vi.fn().mockRejectedValue(new Error("unavailable"));
  const writeText = vi.fn().mockResolvedValue(undefined);
  mockClipboard(writeText);
  renderButton(shareText);

  fireEvent.click(screen.getByRole("button"));

  await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
  expect(writeText.mock.calls[0][0]).toContain("Cover #7");
});
