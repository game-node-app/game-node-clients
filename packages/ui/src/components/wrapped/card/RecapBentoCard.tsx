import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { RecapPlatformMark } from "#@/components/wrapped/card/RecapPlatformMark";
import {
  RecapBackdrop,
  RecapCover,
} from "#@/components/wrapped/card/RecapCover";
import {
  at,
  displayStyle,
  formatHours,
  formatPlaytime,
  monoStyle,
  RECAP_COLORS,
} from "#@/components/wrapped/card/recapCardTheme";
import {
  getRankedGames,
  type RecapCardProps,
} from "#@/components/wrapped/card/recapCardTypes";
import {
  getBackdropOpacity,
  getRecapAccent,
  getRecapExtraStat,
  pickBackdropGame,
} from "#@/components/wrapped/card/recapCustomization";
import { useTranslation } from "@repo/locales";
import type { CSSProperties, PropsWithChildren } from "react";

function Tile({
  x,
  y,
  w,
  h,
  children,
  style,
}: PropsWithChildren<{
  x: number;
  y: number;
  w: number;
  h: number;
  style?: CSSProperties;
}>) {
  return (
    <div
      className={"overflow-hidden"}
      style={{
        ...at(x, y, w, h),
        borderRadius: 36,
        background: RECAP_COLORS.panel,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Bento (Story, 1080x1920), ported from Echo's "Bento": the top game on a
 * brand tile over its art, number tiles, the ranked list and genre/platform.
 */
export function RecapBentoCard({
  username,
  periodText,
  summary,
  figures,
  games,
  custom,
}: RecapCardProps) {
  const { t } = useTranslation();
  const ranked = getRankedGames(summary, games);
  const [top] = ranked;
  const accent = getRecapAccent(custom);
  const backdropGame = pickBackdropGame(ranked, custom);
  const extra = getRecapExtraStat(summary, custom);
  const change = custom?.showComparison ? figures.changePercent : null;
  const topName = top?.game?.name ?? "-";

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{ background: RECAP_COLORS.ground, color: RECAP_COLORS.cream }}
    >
      <div style={at(48, 90)}>
        <GameNodeLogo style={{ width: 180 }} />
      </div>
      <div
        style={{ ...at(520, 108, 512), ...monoStyle(34), textAlign: "right" }}
      >
        {periodText}
      </div>

      <Tile x={48} y={240} w={984} h={560} style={{ background: accent }}>
        <RecapBackdrop game={backdropGame} />
        <div
          className={"absolute inset-0"}
          // The accent sits over the art, so the art shows as the opposite.
          style={{
            background: accent,
            opacity: 1 - getBackdropOpacity(0.18, custom),
          }}
        />
        <div
          style={{ ...at(40, 40), ...monoStyle(28, `${RECAP_COLORS.ink}B3`) }}
        >
          {t("mobile.wrapped.card.topGame")}
        </div>
        <div
          className={"line-clamp-3"}
          style={{
            ...at(40, 0, 900),
            top: undefined,
            bottom: 96,
            ...displayStyle(topName.length > 18 ? 110 : 140, RECAP_COLORS.ink),
          }}
        >
          {topName}
        </div>
        <div
          style={{
            ...at(40, 0),
            top: undefined,
            bottom: 40,
            ...monoStyle(30, RECAP_COLORS.ink),
          }}
        >
          {top ? formatPlaytime(top.seconds) : "-"}
        </div>
      </Tile>

      <Tile x={48} y={820} w={482} h={280}>
        <div style={{ ...at(36, 34), ...monoStyle(24) }}>
          {t("mobile.wrapped.card.hoursPlayed")}
        </div>
        <div style={{ ...at(32, 78), ...displayStyle(150, accent) }}>
          {formatHours(figures.hours)}
          <span style={{ fontSize: 64 }}>h</span>
        </div>
        {change != null && (
          <div
            style={{
              ...at(36, 232, 420),
              ...monoStyle(
                22,
                change >= 0 ? RECAP_COLORS.positive : RECAP_COLORS.negative,
              ),
            }}
          >
            {t("mobile.wrapped.card.vsPrevious", {
              percent: `${change > 0 ? "+" : ""}${change}`,
            })}
          </div>
        )}
      </Tile>
      <Tile x={550} y={820} w={482} h={280}>
        <div style={{ ...at(36, 34), ...monoStyle(24) }}>
          {t("mobile.wrapped.card.gamesPlayed")}
        </div>
        <div
          style={{ ...at(32, 78), ...displayStyle(150, RECAP_COLORS.cream) }}
        >
          {figures.games}
        </div>
        <div
          className={"truncate"}
          style={{ ...at(36, 232, 420), ...monoStyle(22) }}
        >
          {username ? `@${username}` : ""}
        </div>
      </Tile>

      <Tile x={48} y={1120} w={984} h={420}>
        <div style={{ ...at(36, 32), ...monoStyle(24) }}>
          {t("mobile.wrapped.card.topGames")}
        </div>
        {ranked.slice(0, 5).map(({ game, seconds }, index) => (
          <div
            key={game?.id ?? index}
            className={"flex items-center"}
            style={{ ...at(36, 76 + index * 68, 912, 60), gap: 20 }}
          >
            <span
              style={{
                ...monoStyle(26, index === 0 ? accent : RECAP_COLORS.muted),
                width: 28,
              }}
            >
              {index + 1}
            </span>
            <RecapCover game={game} width={44} height={58} radius={8} />
            <span
              className={"flex-1 truncate"}
              style={{
                ...displayStyle(30, RECAP_COLORS.cream, 600),
                letterSpacing: "-0.02em",
              }}
            >
              {game?.name ?? "-"}
            </span>
            <span style={monoStyle(22, RECAP_COLORS.muted, false)}>
              {formatPlaytime(seconds)}
            </span>
          </div>
        ))}
      </Tile>

      <Tile x={48} y={1560} w={482} h={250}>
        <div style={{ ...at(36, 34), ...monoStyle(22) }}>
          {t(extra.labelKey)}
        </div>
        <div
          className={"line-clamp-2"}
          style={{
            ...at(36, 90, 410),
            ...displayStyle(88, RECAP_COLORS.cream),
          }}
        >
          {extra.value}
        </div>
      </Tile>
      <Tile x={550} y={1560} w={482} h={250}>
        <div style={{ ...at(36, 34), ...monoStyle(22) }}>
          {t("mobile.wrapped.card.topPlatform")}
        </div>
        <div style={at(36, 90, 410)}>
          <RecapPlatformMark name={summary.topPlatform?.name} size={50} />
        </div>
      </Tile>

      <div style={{ ...at(48, 1846), ...monoStyle(26, "#6F665B") }}>
        {t("mobile.wrapped.card.madeOn")}
      </div>
    </div>
  );
}
