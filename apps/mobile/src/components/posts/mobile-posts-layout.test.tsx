// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@repo/locales";
import { MobilePostsFeedLayout } from "./MobilePostsFeedLayout";

afterEach(cleanup);

const setup = (onChange = vi.fn()) => {
  render(
    <I18nProvider language="en">
      <MobilePostsFeedLayout currentTab="all" onChange={onChange}>
        <p>feed</p>
      </MobilePostsFeedLayout>
    </I18nProvider>,
  );
  return onChange;
};

describe("MobilePostsFeedLayout", () => {
  it("renders translated tabs with Following disabled and the feed", () => {
    setup();
    expect(
      screen.getByRole("tab", { name: "All" }).getAttribute("aria-selected"),
    ).toBe("true");
    const following = screen.getByRole("tab", {
      name: /Following/,
    }) as HTMLButtonElement;
    expect(following.disabled).toBe(true);
    expect(screen.getByText("Soon")).toBeTruthy();
    expect(screen.getByText("feed")).toBeTruthy();
  });

  it("reports tab changes only for enabled tabs", () => {
    const onChange = setup();
    fireEvent.click(screen.getByRole("tab", { name: "All" }));
    expect(onChange).toHaveBeenCalledWith("all");
    fireEvent.click(screen.getByRole("tab", { name: /Following/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
