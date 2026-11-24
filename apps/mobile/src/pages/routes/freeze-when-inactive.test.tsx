// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { afterEach, describe, expect, it } from "vitest";
import { matchPath, Route, Router, useLocation } from "react-router";
import type { RouteProps } from "react-router";
import { freezeInactiveView } from "./FreezeWhenInactive";

const renders: Record<string, number> = {};
const countRender = (name: string) => {
  renders[name] = (renders[name] ?? 0) + 1;
};

function Page({ name }: { name: string }) {
  const location = useLocation();
  countRender(name);
  return (
    <p data-testid={name}>
      {location.pathname}
      {location.search}
    </p>
  );
}

/**
 * Like Ionic's StackManager: every visited view stays mounted and gets its
 * own frozen `computedMatch`.
 */
function view(path: string, url: string, name: string) {
  const route = freezeInactiveView(
    <Route exact path={path} render={() => <Page name={name} />} />,
  );
  const props = {
    computedMatch: matchPath(url, { path, exact: true }),
  } as Partial<RouteProps>;
  return <route.type {...route.props} {...props} key={name} />;
}

describe("freezeInactiveView", () => {
  afterEach(() => {
    cleanup();
    for (const key of Object.keys(renders)) delete renders[key];
  });

  it("keeps hidden views on their own route and skips their re-renders", () => {
    const history = createMemoryHistory({ initialEntries: ["/home/game/1"] });
    const app = () => (
      <Router history={history}>
        {view("/home/game/:id", "/home/game/1", "game-1")}
        {history.location.pathname === "/home/game/2" ||
        renders["game-2"] != undefined
          ? view("/home/game/:id", "/home/game/2", "game-2")
          : null}
      </Router>
    );
    const { rerender } = render(app());
    expect(screen.getByTestId("game-1").textContent).toBe("/home/game/1");
    const initialRenders = renders["game-1"];

    act(() => history.push("/home/game/2"));
    rerender(app());

    expect(screen.getByTestId("game-2").textContent).toBe("/home/game/2");
    expect(screen.getByTestId("game-1").textContent).toBe("/home/game/1");
    expect(renders["game-1"]).toBe(initialRenders);

    act(() => history.push("/home/game/2?tab=reviews"));
    expect(screen.getByTestId("game-2").textContent).toBe(
      "/home/game/2?tab=reviews",
    );
    expect(renders["game-1"]).toBe(initialRenders);

    act(() => history.push("/home/game/1"));
    expect(screen.getByTestId("game-1").textContent).toBe("/home/game/1");
    expect(renders["game-1"]).toBeGreaterThan(initialRenders);
    expect(screen.getByTestId("game-2").textContent).toBe(
      "/home/game/2?tab=reviews",
    );
  });
});
