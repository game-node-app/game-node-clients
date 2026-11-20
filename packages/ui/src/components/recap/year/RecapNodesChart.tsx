import type { Game, RecapTopGameDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import {
  formatPlaytimeHours,
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import {
  getRecapNodeLayout,
  getRecapYearFraction,
  RECAP_CHART,
  type RecapNodeLayout,
} from "#@/components/recap/year/util/recapYear";
import { useEffect, useRef, useState } from "react";

export interface RecapNodesChartProps {
  year: number;
  topGames: RecapTopGameDto[];
  /** Hydrated games, for the cover and name of the labelled nodes. */
  games: Game[] | undefined;
  /** Accessible name of the chart, e.g. "Your year in 38 nodes". */
  label: string;
  /** Fallback name when a game was not hydrated. */
  gameLabel: (gameId: number) => string;
  /**
   * Instant of the "today" marker of a live Recap; the rest of the year is
   * dimmed after it. Omit for a closed Recap.
   */
  today?: string | null;
  /** Text of the "today" marker, e.g. "Today · Nov 15". */
  todayLabel?: string | null;
}

// theme-exempt: recap chart artwork palette
const COLORS = {
  grid: "#2a2a2a",
  path: "#3d3d3d",
  muted: "#808080",
  secondaryText: "#adadad",
  primary: "#f15025",
  secondary: "#f7896d",
  hollow: "#0b0b0b",
  surface: "#161616",
} as const;

const NODE_FILL: Record<RecapNodeLayout["tier"], string> = {
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  muted: COLORS.hollow,
};

const CHIP_HEIGHT = 42;
const CHIP_GAP = 8;
/** Chip chrome around the game name: padding, cover, gaps and the border. */
const CHIP_CHROME_WIDTH = 4 + 24 + 8 + 10 + 2;
const CHIP_CHAR_WIDTH = 7.6;
const MAX_CHIPS = 4;
const NARROW_CHART = 560;

interface Chip {
  node: RecapNodeLayout;
  left: number;
  top: number;
  width: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const overlaps = (a: Box, b: Box) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height;

const nodeBox = (node: RecapNodeLayout): Box => ({
  left: node.x - node.radius,
  top: node.y - node.radius,
  width: node.radius * 2,
  height: node.radius * 2,
});

/**
 * Labels the largest nodes (cover, name and hours) next to them: to the right
 * if there is room, else to the left, as long as the chip does not cover
 * another chip or a highlighted node.
 */
function placeChips(
  nodes: RecapNodeLayout[],
  width: number,
  names: Map<number, string>,
  reserved: Box[] = [],
): Chip[] {
  const limit = width >= 700 ? MAX_CHIPS : 2;
  const highlighted = nodes.filter((node) => node.tier !== "muted");
  const chips: Chip[] = [];

  for (const node of nodes) {
    if (chips.length >= limit || node.tier === "muted") break;

    const chipWidth =
      CHIP_CHROME_WIDTH +
      Math.max(40, (names.get(node.gameId)?.length ?? 8) * CHIP_CHAR_WIDTH);
    const top = node.y - CHIP_HEIGHT / 2;
    const candidates = [
      node.x + node.radius + CHIP_GAP,
      node.x - node.radius - CHIP_GAP - chipWidth,
    ];

    const left = candidates.find((candidate) => {
      if (candidate < 0 || candidate + chipWidth > width) return false;
      const box = {
        left: candidate,
        top,
        width: chipWidth,
        height: CHIP_HEIGHT,
      };
      return (
        !chips.some((chip) =>
          overlaps(box, { ...chip, height: CHIP_HEIGHT }),
        ) &&
        !reserved.some((area) => overlaps(box, area)) &&
        !highlighted.some(
          (other) => other !== node && overlaps(box, nodeBox(other)),
        )
      );
    });

    if (left !== undefined) {
      chips.push({ node, left, top, width: chipWidth });
    }
  }

  return chips;
}

/**
 * Hero chart of the Recap (frame `5415:955`): a month timeline where each top
 * game is a node placed by the day it was first played, sized by the square
 * root of its hours and joined to the next one in chronological order. The
 * largest nodes carry a label chip; a live Recap dims the rest of the year
 * after the "today" marker. Plain SVG, laid out in px from the rendered width.
 */
export function RecapNodesChart({
  year,
  topGames,
  games,
  label,
  gameLabel,
  today,
  todayLabel,
}: RecapNodesChartProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(RECAP_CHART.designWidth);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const update = () => {
      const next = Math.round(container.getBoundingClientRect().width);
      if (next > 0) {
        setWidth(next);
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const gamesById = new Map((games ?? []).map((game) => [game.id, game]));
  const nodes = getRecapNodeLayout(topGames, year, width);
  const names = new Map(
    nodes.map((node) => [node.gameId, gameLabel(node.gameId)]),
  );
  const todayX = today
    ? (getRecapYearFraction(today, year) ?? 0) * width
    : null;
  const nearEdge = todayX !== null && width - todayX < 150;
  const todayLabelWidth = (todayLabel?.length ?? 0) * 9;
  const chips = placeChips(
    nodes,
    width,
    names,
    todayX !== null && todayLabel
      ? [
          {
            left: nearEdge ? todayX - 9 - todayLabelWidth : todayX + 9,
            top: RECAP_CHART.plotTop + 4,
            width: todayLabelWidth,
            height: 22,
          },
        ]
      : [],
  );
  const path = [...nodes]
    .sort((a, b) => a.x - b.x)
    .map((node) => `${node.x.toFixed(1)},${node.y.toFixed(1)}`)
    .join(" ");

  const months = Array.from({ length: 12 }, (_, month) => ({
    x:
      (getRecapYearFraction(
        new Date(Date.UTC(year, month, 1)).toISOString(),
        year,
      ) ?? 0) * width,
    name:
      formatUtcDate(new Date(Date.UTC(year, month, 1)), locale, {
        month: "short",
      }) ?? "",
  }));
  const showEveryMonth = width >= NARROW_CHART;
  const plotHeight = RECAP_CHART.plotBottom - RECAP_CHART.plotTop;

  return (
    <div
      ref={containerRef}
      data-testid={"recap-hero-chart"}
      className={"relative w-full"}
      style={{ height: RECAP_CHART.height }}
    >
      <svg
        width={width}
        height={RECAP_CHART.height}
        role={"img"}
        aria-label={label}
        className={"absolute inset-0 block"}
      >
        {months.map((month, index) => (
          <g key={index}>
            <line
              x1={month.x + 0.5}
              x2={month.x + 0.5}
              y1={RECAP_CHART.plotTop}
              y2={RECAP_CHART.plotBottom}
              stroke={COLORS.grid}
            />
            {(showEveryMonth || index % 2 === 0) && (
              <text
                x={month.x + 7.5}
                y={RECAP_CHART.monthLabelTop + 11}
                fontSize={12}
                fontWeight={700}
                letterSpacing={0.72}
                fill={COLORS.muted}
                className={"uppercase"}
              >
                {month.name}
              </text>
            )}
          </g>
        ))}

        {todayX !== null && (
          <g>
            <rect
              x={todayX}
              y={RECAP_CHART.plotTop}
              width={Math.max(0, width - todayX)}
              height={plotHeight}
              fill={COLORS.surface}
            />
            <rect
              x={todayX}
              y={RECAP_CHART.plotTop}
              width={2}
              height={plotHeight}
              fill={COLORS.secondaryText}
            />
            {todayLabel && (
              <text
                data-testid={"recap-hero-today"}
                x={nearEdge ? todayX - 9 : todayX + 9}
                y={RECAP_CHART.plotTop + 20}
                fontSize={12}
                fontWeight={700}
                letterSpacing={0.72}
                fill={COLORS.secondaryText}
                className={"uppercase"}
                textAnchor={nearEdge ? "end" : "start"}
              >
                {todayLabel}
              </text>
            )}
          </g>
        )}

        {nodes.length > 1 && (
          <polyline
            points={path}
            fill={"none"}
            stroke={COLORS.path}
            strokeWidth={1.5}
            strokeLinejoin={"round"}
          />
        )}

        {/* Smaller nodes last, so the big ones never hide them. */}
        {[...nodes].reverse().map((node) => (
          <g
            key={`${node.gameId}-${node.index}`}
            data-testid={"recap-hero-node"}
            data-game-id={node.gameId}
            data-tier={node.tier}
          >
            {node.tier === "muted" ? (
              <circle
                cx={node.x}
                cy={node.y}
                r={Math.max(1, node.radius - 0.75)}
                fill={NODE_FILL.muted}
                stroke={COLORS.muted}
                strokeWidth={1.5}
              />
            ) : (
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={NODE_FILL[node.tier]}
              />
            )}
          </g>
        ))}
      </svg>

      {chips.map((chip) => {
        const game = gamesById.get(chip.node.gameId);
        const cover = getSizedImageUrl(
          getCoverUrl(game),
          ImageSize.COVER_SMALL,
        );
        const hours = formatPlaytimeHours(
          topGames[chip.node.index]?.totalPlaytimeSeconds,
          locale,
        );

        return (
          <div
            key={chip.node.gameId}
            data-testid={"recap-hero-chip"}
            style={{ left: chip.left, top: chip.top }}
            className={
              "absolute flex items-center gap-2 overflow-hidden rounded-lg border border-[#2a2a2a] bg-paper-5 py-1 pr-2.5 pl-1 whitespace-nowrap"
            }
          >
            <div
              className={"h-8 w-6 shrink-0 overflow-hidden rounded bg-paper-0"}
            >
              {cover && (
                <img
                  src={cover}
                  alt={""}
                  className={"h-full w-full object-cover"}
                />
              )}
            </div>
            <div className={"flex flex-col"}>
              <span className={"text-sm leading-5 font-medium text-white"}>
                {names.get(chip.node.gameId)}
              </span>
              {hours && (
                <span
                  className={
                    "text-xs leading-none font-bold tracking-[0.06em] text-[#adadad] uppercase"
                  }
                >
                  {t("events.card.recap.hours", { hours })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
