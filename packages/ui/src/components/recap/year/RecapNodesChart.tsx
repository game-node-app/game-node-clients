import type { Game, RecapTopGameDto } from "@repo/wrapper/server";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { getRecapNodeLayout } from "#@/components/recap/year/util/recapYear";
import { useId } from "react";

export interface RecapNodesChartProps {
  year: number;
  topGames: RecapTopGameDto[];
  /** Hydrated games, for the covers and the labels of the 4 largest nodes. */
  games: Game[] | undefined;
  /** Accessible name of the chart, e.g. "Your year in 38 nodes". */
  label: string;
  /** Fallback name when a game was not hydrated. */
  gameLabel: (gameId: number) => string;
}

/** The four largest nodes (first in the playtime order) carry a label. */
const LABELLED_NODES = 4;

/**
 * Hero chart of the Recap: one node per top game, positioned by the month of
 * `firstPlayedAt` and sized by the square root of the hours (design §10).
 * Plain SVG, no chart dependency.
 */
export function RecapNodesChart({
  year,
  topGames,
  games,
  label,
  gameLabel,
}: RecapNodesChartProps) {
  const rawClipPrefix = `recap-node-${useId()}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const nodes = getRecapNodeLayout(topGames, year);
  const gamesById = new Map((games ?? []).map((game) => [game.id, game]));

  return (
    <svg
      data-testid={"recap-hero-chart"}
      viewBox={"0 0 100 60"}
      role={"img"}
      aria-label={label}
      className={"w-full h-auto"}
    >
      <defs>
        {nodes.map((node) => (
          <clipPath
            key={`clip-${node.gameId}`}
            id={`${rawClipPrefix}-${node.gameId}`}
          >
            <circle cx={node.x} cy={node.y} r={node.radius} />
          </clipPath>
        ))}
      </defs>
      {nodes.map((node) => {
        const game = gamesById.get(node.gameId);
        const cover = getSizedImageUrl(
          getCoverUrl(game),
          ImageSize.COVER_SMALL,
        );

        return (
          <g
            key={`${node.gameId}-${node.index}`}
            data-testid={"recap-hero-node"}
            data-game-id={node.gameId}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={"#262525"}
              stroke={"#F15025"}
              strokeWidth={0.4}
            />
            {cover && (
              <image
                href={cover}
                x={node.x - node.radius}
                y={node.y - node.radius}
                width={node.radius * 2}
                height={node.radius * 2}
                clipPath={`url(#${rawClipPrefix}-${node.gameId})`}
                preserveAspectRatio={"xMidYMid slice"}
              />
            )}
            {node.index < LABELLED_NODES && (
              <text
                x={node.x}
                y={node.y - node.radius - 1.4}
                textAnchor={
                  node.x < 20 ? "start" : node.x > 80 ? "end" : "middle"
                }
                fontSize={2.4}
                fill={"#D9D9D9"}
              >
                {gameLabel(node.gameId)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
