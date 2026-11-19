// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { useTabSlideAnimation } from "./useTabSlideAnimation";

function TestOutlet({
  pathname,
  nextTab,
}: {
  pathname: string;
  nextTab: string;
}) {
  const { outletRef, onIonTabsWillChange } = useTabSlideAnimation(pathname);
  return (
    <>
      <button
        onClick={() =>
          onIonTabsWillChange(
            new CustomEvent("ionTabWillChange", { detail: { tab: nextTab } }),
          )
        }
      >
        Switch tabs
      </button>
      {createElement(
        "ion-router-outlet",
        { ref: outletRef },
        <div data-testid="page">
          <div data-testid="nested" />
        </div>,
      )}
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each([
  ["/home", "/explore", "explore", -32],
  ["/explore", "/wrapped/preferences", "wrapped", 32],
])("slides from %s to %s in tab-bar order", (from, to, nextTab, offset) => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  const cancel = vi.fn();
  const animate = vi.fn(() => ({ cancel }));
  const page = render(<TestOutlet pathname={from} nextTab={nextTab} />);
  Object.defineProperty(screen.getByTestId("page"), "animate", {
    value: animate,
  });

  fireEvent.click(screen.getByRole("button"));
  page.rerender(<TestOutlet pathname={to} nextTab={nextTab} />);
  fireEvent(screen.getByTestId("nested"), new CustomEvent("ionViewWillEnter"));
  expect(animate).not.toHaveBeenCalled();
  fireEvent(screen.getByTestId("page"), new CustomEvent("ionViewWillEnter"));
  expect(animate).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ transform: `translateX(${offset}px)` }),
    ]),
    expect.objectContaining({ duration: 280 }),
  );

  page.rerender(<TestOutlet pathname={`${to}/game/1`} nextTab={nextTab} />);
  fireEvent(screen.getByTestId("page"), new CustomEvent("ionViewWillEnter"));
  expect(animate).toHaveBeenCalledTimes(1);
  expect(cancel).toHaveBeenCalledTimes(1);
});

it("honors reduced motion on a tab switch", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const animate = vi.fn();
  const page = render(<TestOutlet pathname="/home" nextTab="explore" />);
  Object.defineProperty(screen.getByTestId("page"), "animate", {
    value: animate,
  });

  fireEvent.click(screen.getByRole("button"));
  page.rerender(<TestOutlet pathname="/explore" nextTab="explore" />);
  fireEvent(screen.getByTestId("page"), new CustomEvent("ionViewWillEnter"));
  expect(animate).not.toHaveBeenCalled();
});
