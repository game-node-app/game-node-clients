import React from "react";

/**
 * Next tile index for a key press inside a console row, or null when the key doesn't move focus.
 */
export function getNextRovingIndex(
  current: number,
  key: string,
  total: number,
): number | null {
  if (total === 0) return null;
  switch (key) {
    case "ArrowRight":
      return Math.min(current + 1, total - 1);
    case "ArrowLeft":
      return Math.max(current - 1, 0);
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return null;
  }
}

const tilesOf = (row: Element) =>
  Array.from(row.querySelectorAll<HTMLElement>("[data-console-tile]"));

/**
 * D-pad style navigation: ←/→/Home/End move inside a row, ↑/↓ jump to the
 * same position in the previous/next row. Enter is handled by the tile's link.
 */
export function handleConsoleRowKeyDown(event: React.KeyboardEvent<HTMLElement>) {
  const row = event.currentTarget;
  const tiles = tilesOf(row);
  const current = tiles.indexOf(document.activeElement as HTMLElement);
  if (current === -1) return;

  let target: HTMLElement | undefined;
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    const rows = Array.from(document.querySelectorAll("[data-console-row]"));
    const nextRow = rows[rows.indexOf(row) + (event.key === "ArrowDown" ? 1 : -1)];
    const nextTiles = nextRow ? tilesOf(nextRow) : [];
    target = nextTiles[Math.min(current, nextTiles.length - 1)];
  } else {
    const next = getNextRovingIndex(current, event.key, tiles.length);
    if (next != null) target = tiles[next];
  }

  if (target == undefined) return;
  event.preventDefault();
  target.focus();
  target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}
