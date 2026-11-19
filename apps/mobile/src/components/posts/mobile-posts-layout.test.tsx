// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import { MobilePostsFeedEmpty } from "./MobilePostsFeedEmpty";
import { MobilePostsFeedLayout } from "./MobilePostsFeedLayout";
import { MobilePostsFeedSkeleton } from "./MobilePostsFeedSkeleton";

afterEach(cleanup);

describe("MobilePostsFeedLayout", () => {
  it("renders the feed without a switcher while Following does not exist", () => {
    render(
      <I18nProvider language="en">
        <MobilePostsFeedLayout currentTab="all" onChange={vi.fn()}>
          <p>feed</p>
        </MobilePostsFeedLayout>
      </I18nProvider>,
    );
    expect(screen.getByText("feed")).toBeTruthy();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByText(/Following|Soon/)).toBeNull();
  });
});

const feed = vi.hoisted(() => ({
  state: { isPending: true, data: undefined as unknown },
}));
vi.mock("@repo/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/ui")>()),
  useInfinitePostsFeed: () => feed.state,
}));

describe("posts feed states", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("shows a skeleton while the first page is pending", () => {
    feed.state = { isPending: true, data: undefined };
    render(
      <I18nProvider language="en">
        <MantineProvider>
          <MobilePostsFeedSkeleton criteria="all" />
        </MantineProvider>
      </I18nProvider>,
    );
    expect(screen.getByRole("status")).toBeTruthy();
    cleanup();
    feed.state = { isPending: false, data: { pages: [{ data: [] }] } };
    const { container } = render(
      <I18nProvider language="en">
        <MantineProvider>
          <MobilePostsFeedSkeleton criteria="all" />
        </MantineProvider>
      </I18nProvider>,
    );
    expect(container.querySelector("[role=status]")).toBeNull();
  });

  it("offers a Create post action in the empty state", () => {
    feed.state = { isPending: false, data: { pages: [{ data: [] }] } };
    const onCreate = vi.fn();
    render(
      <I18nProvider language="en">
        <MobilePostsFeedEmpty criteria="all" onCreate={onCreate} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText("Create post"));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
