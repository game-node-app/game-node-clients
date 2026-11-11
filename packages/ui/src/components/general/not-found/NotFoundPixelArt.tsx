import { Box } from "@mantine/core";
import { useState } from "react";
import { Game } from "@repo/wrapper/server";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { cn } from "#@/util";

/**
 * One cell of a digit's pixel grid.
 * `X` = filled brand square, `.` = empty, `M` = missing pixel,
 * `C1`/`C2`/`C3` = trending game cover tile.
 */
type PixelCell = "X" | "." | "M" | "C1" | "C2" | "C3";

const BRAND_COLOR = "#F15025";
const MISSING_PIXEL_BORDER = "#2A2A2A";
const CELL_BORDER_RADIUS = 4;
const DIGIT_COLUMNS = 4;
const DIGIT_ROWS = 5;

/** "404", each digit as a 4x5 grid (see the Figma "D1 · Fase não encontrada"). */
const DIGITS: PixelCell[][][] = [
  [
    ["X", ".", ".", "X"],
    ["X", ".", ".", "X"],
    ["X", "C1", "X", "X"],
    [".", ".", ".", "X"],
    [".", ".", ".", "X"],
  ],
  [
    ["X", "X", "C2", "X"],
    ["X", ".", ".", "X"],
    ["X", ".", ".", "X"],
    ["X", ".", ".", "X"],
    ["X", "M", "X", "X"],
  ],
  [
    ["M", ".", ".", "X"],
    ["X", ".", ".", "X"],
    ["X", "X", "C3", "X"],
    [".", ".", ".", "X"],
    [".", ".", ".", "X"],
  ],
];

const COVER_CELL_GAME_INDEX: Record<"C1" | "C2" | "C3", number> = {
  C1: 0,
  C2: 1,
  C3: 2,
};

const BrandSquare = ({ cellSize }: { cellSize: number }) => (
  <Box
    style={{
      width: cellSize,
      height: cellSize,
      borderRadius: CELL_BORDER_RADIUS,
      backgroundColor: BRAND_COLOR,
    }}
  />
);

const MissingPixel = ({ cellSize }: { cellSize: number }) => (
  <Box
    style={{
      width: cellSize,
      height: cellSize,
      borderRadius: CELL_BORDER_RADIUS,
      border: `2px dashed ${MISSING_PIXEL_BORDER}`,
      backgroundColor: "transparent",
    }}
  />
);

const CoverCell = ({ game, cellSize }: { game?: Game; cellSize: number }) => {
  const [failed, setFailed] = useState(false);
  const coverUrl = game
    ? getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG)
    : undefined;

  if (!game || !coverUrl || failed) {
    return <BrandSquare cellSize={cellSize} />;
  }

  return (
    <img
      src={coverUrl}
      alt={game.name}
      width={cellSize}
      height={cellSize}
      loading={"lazy"}
      decoding={"async"}
      style={{
        width: cellSize,
        height: cellSize,
        borderRadius: CELL_BORDER_RADIUS,
        objectFit: "cover",
      }}
      onError={() => setFailed(true)}
    />
  );
};

const Pixel = ({
  cell,
  cellSize,
  games,
}: {
  cell: PixelCell;
  cellSize: number;
  games: Game[];
}) => {
  switch (cell) {
    case "X":
      return <BrandSquare cellSize={cellSize} />;
    case "M":
      return <MissingPixel cellSize={cellSize} />;
    case "C1":
    case "C2":
    case "C3":
      return (
        <CoverCell
          game={games[COVER_CELL_GAME_INDEX[cell]]}
          cellSize={cellSize}
        />
      );
    case ".":
    default:
      return <Box />;
  }
};

export interface NotFoundPixelArtProps {
  /** Square cell size in pixels (44 on desktop, 18 on mobile). */
  cellSize: number;
  /** Trending games, used for the cover tiles in reading order. */
  games?: Game[];
  className?: string;
}

/**
 * Decorative pixel-art "404". Covers are trending games; while they load (or
 * when a cover is missing) the tile falls back to a filled brand square.
 */
const NotFoundPixelArt = ({
  cellSize,
  games = [],
  className,
}: NotFoundPixelArtProps) => {
  // One step is also the gap between two digits.
  const gap = cellSize >= 32 ? 6 : 3;
  const step = cellSize + gap;

  return (
    <Box
      aria-hidden
      className={cn("flex shrink-0 select-none", className)}
      style={{ gap: step }}
    >
      {DIGITS.map((digit, digitIndex) => (
        <Box
          key={digitIndex}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${DIGIT_COLUMNS}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${DIGIT_ROWS}, ${cellSize}px)`,
            gap,
          }}
        >
          {digit.map((row, rowIndex) =>
            row.map((cell, columnIndex) => (
              <Pixel
                key={`${rowIndex}-${columnIndex}`}
                cell={cell}
                cellSize={cellSize}
                games={games}
              />
            )),
          )}
        </Box>
      ))}
    </Box>
  );
};

export { NotFoundPixelArt };
