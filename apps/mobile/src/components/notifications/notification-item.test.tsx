// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps, ReactElement } from "react";
import type { NotificationLeading } from "../../../../../packages/ui/src/components/notifications/util/getNotificationContent";
import { NotificationItem } from "../../../../../packages/ui/src/components/notifications/view/NotificationItem";
import { NotificationsTabs } from "../../../../../packages/ui/src/components/notifications/view/NotificationsTabs";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const ALICE_AVATAR = {
  id: 1,
  filename: "alice_avatar",
  extension: "png",
};

function renderUI(ui: ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

function renderItem(
  overrides: Partial<ComponentProps<typeof NotificationItem>> = {},
) {
  const props: ComponentProps<typeof NotificationItem> = {
    leading: { kind: "avatar", avatar: ALICE_AVATAR },
    name: "alice",
    time: "2 min",
    message: "started following you.",
    unread: true,
    onClick: vi.fn(),
    ...overrides,
  };

  const result = renderUI(<NotificationItem {...props} />);

  return { ...result, props };
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("NotificationItem", () => {
  it("renders the name, time and message and builds the avatar URL from the DTO", () => {
    const { container } = renderItem();

    expect(screen.getByText("alice")).toBeTruthy();
    expect(screen.getByText("2 min")).toBeTruthy();

    const message = screen.getByText("started following you.");
    expect(message).toBeTruthy();
    expect(message.className).toContain("line-clamp-2");

    expect(container.querySelector('img[src="alice_avatar.png"]')).toBeTruthy();
  });

  it("marks an unread item with a white message, the orange dot and hidden text", () => {
    const { container } = renderItem({ unread: true });

    const message = screen.getByText("started following you.");
    expect(message.className).toContain("text-nav-text");
    expect(container.querySelector(".bg-brand-5")).toBeTruthy();
    expect(screen.getByText("notifications.unread")).toBeTruthy();
  });

  it("renders a read item with a muted message and no unread indicator", () => {
    const { container } = renderItem({ unread: false });

    const message = screen.getByText("started following you.");
    expect(message.className).toContain("text-nav-muted");
    expect(screen.queryByText("notifications.unread")).toBeNull();
    expect(container.querySelector(".bg-brand-5")).toBeNull();
  });

  it("calls onClick when the item is clicked", () => {
    const onClick = vi.fn();
    renderItem({ onClick });

    fireEvent.click(screen.getByRole("button", { name: /alice/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when Enter is pressed on the focused item", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderItem({ onClick });

    const item = screen.getByRole("button", { name: /alice/i });
    item.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not trigger the item when the action is clicked", () => {
    const onClick = vi.fn();
    const actionClick = vi.fn();
    renderItem({
      onClick,
      action: { label: "Follow back", onClick: actionClick },
    });

    fireEvent.click(screen.getByRole("button", { name: "Follow back" }));

    expect(actionClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not trigger the item when Enter is pressed on the action", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const actionClick = vi.fn();
    renderItem({
      onClick,
      action: { label: "Follow back", onClick: actionClick },
    });

    const action = screen.getByRole("button", { name: "Follow back" });
    action.focus();
    await user.keyboard("{Enter}");

    expect(actionClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables and marks the action as busy while it is loading", () => {
    const { container } = renderItem({
      action: { label: "Follow back", onClick: vi.fn(), loading: true },
    });

    const action = screen.getByRole("button", { name: "Follow back" });
    expect(action.hasAttribute("disabled")).toBe(true);
    expect(action.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector(".mantine-Loader-root")).toBeTruthy();
  });

  it("sizes the game cover and falls back to the actor avatar when it fails", () => {
    const leading: NotificationLeading = {
      kind: "cover",
      url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1234.jpg",
      alt: "Elden Ring",
      avatar: { id: 2, filename: "bob_avatar", extension: "webp" },
    };

    const { container } = renderItem({ leading });

    const cover = screen.getByAltText("Elden Ring");
    expect(cover.getAttribute("src")).toBe(
      "https://images.igdb.com/igdb/image/upload/t_cover_small/co1234.jpg",
    );

    fireEvent.error(cover);

    expect(screen.queryByAltText("Elden Ring")).toBeNull();
    expect(container.querySelector('img[src="bob_avatar.webp"]')).toBeTruthy();
  });
});

describe("NotificationsTabs", () => {
  it("exposes the tablist with the selected tab and its unread counter", () => {
    const onChange = vi.fn();
    renderUI(
      <NotificationsTabs value="unread" onChange={onChange} unreadCount={3} />,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute("aria-selected")).toBe("false");
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(tabs[1].textContent).toContain("notifications.tabs.unread");
    expect(tabs[1].textContent).toContain("3");
  });

  it("changes the selected filter when a tab is clicked", () => {
    const onChange = vi.fn();
    renderUI(
      <NotificationsTabs value="all" onChange={onChange} unreadCount={0} />,
    );

    fireEvent.click(
      screen.getByRole("tab", { name: "notifications.tabs.unread" }),
    );

    expect(onChange).toHaveBeenCalledWith("unread");
  });
});
