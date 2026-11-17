import type { Game, RecapTopGameDto } from "@repo/wrapper/server";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { getRecapNodeLayout } from "#@/components/recap/year/util/recapYear";
import { useEffect, useId, useRef, useState } from "react";

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

/** On-screen size of the node labels, in CSS pixels: grows with the chart. */
const LABEL_FONT_MIN_PX = 9;
const LABEL_FONT_MAX_PX = 12;
const VIEWBOX_WIDTH = 100;

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
  const svgRef = useRef<SVGSVGElement>(null);
  const [pxPerUnit, setPxPerUnit] = useState(VIEWBOX_WIDTH / 10);
  const nodes = getRecapNodeLayout(topGames, year);

  // The viewBox scales with the card width, which blew the labels up on wide
  // screens; size them in screen pixels instead.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof ResizeObserver === "undefined") {
      return;
    }

    const update = () => {
      const width = svg.getBoundingClientRect().width;
      if (width > 0) {
        setPxPerUnit(width / VIEWBOX_WIDTH);
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  const labelFontSize =
    Math.min(LABEL_FONT_MAX_PX, Math.max(LABEL_FONT_MIN_PX, pxPerUnit * 3.5)) /
    pxPerUnit;
  const gamesById = new Map((games ?? []).map((game) => [game.id, game]));

  return (
    <svg
      ref={svgRef}
      data-testid={"recap-hero-chart"}
      viewBox={"0 0 100 60"}
      role={"img"}
      aria-label={label}
      className={"mx-auto h-auto w-full max-w-3xl"}
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
                y={node.y - node.radius - labelFontSize * 0.5}
                textAnchor={
                  node.x < 20 ? "start" : node.x > 80 ? "end" : "middle"
                }
                fontSize={labelFontSize}
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
