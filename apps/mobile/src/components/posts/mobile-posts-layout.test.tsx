// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import { PostsFeedEmpty, PostsFeedSkeleton } from "@repo/ui";
import { MobilePostsFeedLayout } from "./MobilePostsFeedLayout";

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

describe("posts feed states", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("shows a loading placeholder while the first page is pending", () => {
    render(
      <I18nProvider language="en">
        <MantineProvider>
          <PostsFeedSkeleton />
        </MantineProvider>
      </I18nProvider>,
    );
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("offers a Create post action in the empty state", () => {
    const onCreate = vi.fn();
    render(
      <I18nProvider language="en">
        <MantineProvider>
          <PostsFeedEmpty onCreate={onCreate} />
        </MantineProvider>
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText("Create post"));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
