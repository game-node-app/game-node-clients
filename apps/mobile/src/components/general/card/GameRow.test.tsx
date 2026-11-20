// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@repo/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/ui")>()),
  GameFigureImage: ({ game }: { game?: { name: string } }) => (
    <img alt={game?.name} />
  ),
  Link: ({ href, children, className }: React.HTMLProps<HTMLAnchorElement>) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { GameRow } from "./GameRow";
import { ListEmptyState } from "@repo/ui";

describe("GameRow", () => {
  afterEach(cleanup);

  it("renders cover, title, meta, chips and links the text area", () => {
    render(
      <GameRow
        game={{ name: "Hades" } as never}
        title="Hades"
        meta="meta line"
        chips={<span>PC</span>}
        leading={12}
        href="/library/u1/collection/entry/e1"
      />,
    );
    expect(screen.getByAltText("Hades")).toBeTruthy();
    expect(screen.getByText("meta line")).toBeTruthy();
    expect(screen.getByText("PC")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/library/u1/collection/entry/e1",
    );
  });

  it("renders no link without href", () => {
    render(<GameRow game={undefined} title="No link" />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("ListEmptyState", () => {
  afterEach(cleanup);

  it("renders title, description and action", () => {
    render(
      <ListEmptyState
        icon={<i />}
        title="Empty"
        description="Nothing here"
        action={<button>Go</button>}
      />,
    );
    expect(screen.getByText("Empty")).toBeTruthy();
    expect(screen.getByText("Nothing here")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go" })).toBeTruthy();
  });
});
