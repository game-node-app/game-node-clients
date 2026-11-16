// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import en from "../../../../../packages/locales/src/translations/json/en.json";
import LiveUpdateListener from "./LiveUpdateListener";
import { useLiveUpdate, type LiveUpdateState } from "./useLiveUpdate";

vi.mock("./useLiveUpdate", () => ({ useLiveUpdate: vi.fn() }));
vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn(), update: vi.fn(), hide: vi.fn() },
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: translate }),
}));

function translate(key: string, options?: { progress: number }) {
  const field = key.replace(
    "mobileLiveUpdate.",
    "",
  ) as keyof typeof en.mobileLiveUpdate;
  return en.mobileLiveUpdate[field].replace(
    "{{progress}}",
    String(options?.progress),
  );
}

const restart = vi.fn();
const retry = vi.fn();
const dismiss = vi.fn();
function setState(state: LiveUpdateState) {
  vi.mocked(useLiveUpdate).mockReturnValue({ state, restart, retry, dismiss });
}
function renderMessage(message?: ReactNode) {
  const latest =
    vi.mocked(notifications.update).mock.lastCall?.[0] ??
    vi.mocked(notifications.show).mock.lastCall?.[0];
  return render(
    <MantineProvider>{message ?? latest?.message}</MantineProvider>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  setState({ status: "idle" });
});
afterEach(cleanup);

it("keeps idle checks invisible", () => {
  render(<LiveUpdateListener />);
  expect(notifications.show).not.toHaveBeenCalled();
  expect(restart).not.toHaveBeenCalled();
});

it("updates one persistent notification with real progress without offering restart early", () => {
  setState({ status: "downloading", progress: null });
  const listener = render(<LiveUpdateListener />);
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "mobile-live-update",
      loading: true,
      autoClose: false,
      withCloseButton: false,
    }),
  );
  const initialMessage = renderMessage();
  expect(screen.getByText(en.mobileLiveUpdate.downloading)).toBeTruthy();
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
  initialMessage.unmount();

  setState({ status: "downloading", progress: 42.9 });
  listener.rerender(<LiveUpdateListener />);
  const progressMessage = renderMessage();
  expect(screen.getByText("Downloading update: 42%")).toBeTruthy();
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
    "42.9",
  );
  expect(screen.getByRole("progressbar").getAttribute("aria-label")).toBe(
    en.mobileLiveUpdate.progressLabel,
  );
  progressMessage.unmount();

  setState({ status: "downloading", progress: 100 });
  listener.rerender(<LiveUpdateListener />);
  renderMessage();
  expect(screen.getByText(en.mobileLiveUpdate.preparing)).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
  expect(notifications.show).toHaveBeenCalledOnce();
  expect(notifications.hide).not.toHaveBeenCalled();
  expect(restart).not.toHaveBeenCalled();
});

it("only restarts on explicit user action and allows postponing", () => {
  setState({ status: "ready" });
  render(<LiveUpdateListener />);
  renderMessage();
  expect(screen.getByText(en.mobileLiveUpdate.ready)).toBeTruthy();
  expect(restart).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: en.mobileLiveUpdate.restartNow }),
  );
  expect(restart).toHaveBeenCalledOnce();
  fireEvent.click(
    screen.getByRole("button", { name: en.mobileLiveUpdate.later }),
  );
  expect(dismiss).toHaveBeenCalledOnce();
});

it("disables both actions while restarting", () => {
  setState({ status: "restarting" });
  render(<LiveUpdateListener />);
  renderMessage();
  expect(screen.getByText(en.mobileLiveUpdate.restarting)).toBeTruthy();
  const buttons = screen.getAllByRole("button") as HTMLButtonElement[];
  expect(buttons.every((button) => button.disabled)).toBe(true);
  buttons.forEach((button) => fireEvent.click(button));
  expect(restart).not.toHaveBeenCalled();
  expect(dismiss).not.toHaveBeenCalled();
});

it.each(["download", "restart"] as const)(
  "offers retry and dismiss after %s failure",
  (phase) => {
    setState({ status: "error", phase });
    render(<LiveUpdateListener />);
    renderMessage();
    expect(
      screen.getByText(
        phase === "restart"
          ? en.mobileLiveUpdate.restartError
          : en.mobileLiveUpdate.downloadError,
      ),
    ).toBeTruthy();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red", loading: false }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: en.mobileLiveUpdate.retry }),
    );
    expect(retry).toHaveBeenCalledOnce();
    fireEvent.click(
      screen.getByRole("button", { name: en.mobileLiveUpdate.dismiss }),
    );
    expect(dismiss).toHaveBeenCalledOnce();
  },
);

it("hides the notification on idle and cleans it up on unmount", () => {
  setState({ status: "ready" });
  const listener = render(<LiveUpdateListener />);
  setState({ status: "idle" });
  listener.rerender(<LiveUpdateListener />);
  expect(notifications.hide).toHaveBeenCalledOnce();
  setState({ status: "ready" });
  listener.rerender(<LiveUpdateListener />);
  expect(notifications.show).toHaveBeenCalledTimes(2);
  listener.unmount();
  expect(notifications.hide).toHaveBeenCalledTimes(2);
  expect(dismiss).not.toHaveBeenCalled();
});
