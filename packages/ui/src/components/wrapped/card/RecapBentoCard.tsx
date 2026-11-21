import { getPlatformShortName } from "#@/components/wrapped/util/recapPlatform";
import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { RecapChange } from "#@/components/wrapped/card/RecapChange";
import {
  hasRecapMedia,
  RecapMediaLayer,
} from "#@/components/wrapped/card/RecapMediaLayer";
import {
  RecapBackdrop,
  RecapCover,
} from "#@/components/wrapped/card/RecapCover";
import {
  at,
  displayStyle,
  fitFontSize,
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
  getBackdropBlur,
  getBackdropOpacity,
  RECAP_BACKDROP_BLUR,
  RECAP_BACKDROP_OPACITY,
  getRecapAccent,
  getRecapExtraStat,
  pickBackdropGame,
} from "#@/components/wrapped/card/recapCustomization";
import { pickBackdropImage } from "#@/components/wrapped/card/recapBackdropImages";
import { useTranslation } from "@repo/locales";
import type { CSSProperties, PropsWithChildren } from "react";

/** Default art opacity of the top game tile (the Figma blurred layer). */
/** Gap between the tiles of the bento grid. */
const GAP = 24;
const GRID_X = 48;
const GRID_WIDTH = 984;

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
        borderRadius: 40,
        background: RECAP_COLORS.panel,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Big single-line value of the small bottom tiles, shrunk to fit its width. */
function SmallStat({
  x,
  width,
  label,
  value,
}: {
  x: number;
  width: number;
  label: string;
  value: string;
}) {
  const textWidth = width - 72;

  return (
    <Tile x={x} y={1577} w={width} h={170}>
      <div style={{ ...at(36, 32), ...monoStyle(22), whiteSpace: "nowrap" }}>
        {label}
      </div>
      <div
        className={"truncate"}
        style={{
          ...at(34, 72, textWidth),
          ...displayStyle(
            fitFontSize(value, textWidth, 76),
            RECAP_COLORS.cream,
          ),
        }}
      >
        {value}
      </div>
    </Tile>
  );
}

/**
 * Bento (Story, 1080x1920): the top game on a tile over its blurred art,
 * the hours and games figures, the next four games and genre/platform.
 */
export function RecapBentoCard({
  username,
  periodText,
  summary,
  figures,
  games,
  custom,
  media,
}: RecapCardProps) {
  const { t } = useTranslation();
  const ranked = getRankedGames(summary, games);
  const [top] = ranked;
  const nextUp = ranked.slice(1, 5);
  const accent = getRecapAccent(custom);
  const backdropGame = pickBackdropGame(ranked, custom);
  const backdropImage = pickBackdropImage(backdropGame, custom);
  const backdropBlur = getBackdropBlur(RECAP_BACKDROP_BLUR.bento, custom);
  const extra = getRecapExtraStat(summary, custom);
  const showChange = !!custom?.showComparison && figures.changePercent != null;
  const topName = top?.game?.name ?? "-";
  const hoursText = `${formatHours(figures.hours)}h`;
  const gamesText = `${figures.games}`;

  const smallStats = [
    {
      key: "genre",
      label: t("mobile.wrapped.card.topGenre"),
      value: summary.topGenre?.name || "-",
    },
    {
      key: "platform",
      label: t("mobile.wrapped.card.topPlatform"),
      value: getPlatformShortName(summary.topPlatform?.name) ?? "-",
    },
    ...(Number(extra.value) > 0
      ? [{ key: "extra", label: t(extra.labelKey), value: extra.value }]
      : []),
  ];
  const smallWidth =
    (GRID_WIDTH - GAP * (smallStats.length - 1)) / smallStats.length;

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: media?.video ? "transparent" : RECAP_COLORS.ground,
        color: RECAP_COLORS.cream,
      }}
    >
      <div style={at(GRID_X, 88)}>
        <GameNodeLogo style={{ width: 140 }} />
      </div>
      <div
        className={"flex items-center"}
        style={{
          position: "absolute",
          right: GRID_X,
          top: 84,
          height: 61,
          boxSizing: "border-box",
          padding: "0 22px",
          borderRadius: 999,
          background: `${RECAP_COLORS.panel}E6`,
          border: `2px solid ${RECAP_COLORS.cream}33`,
        }}
      >
        <span
          style={{ ...monoStyle(26, RECAP_COLORS.cream), whiteSpace: "nowrap" }}
        >
          {periodText}
        </span>
      </div>

      <Tile
        x={48}
        y={155}
        w={984}
        h={620}
        style={media?.video ? { background: "transparent" } : undefined}
      >
        {hasRecapMedia(media) ? (
          <RecapMediaLayer media={media} template={"bento"} fill />
        ) : (
          <>
            <RecapBackdrop
              game={backdropGame}
              imageUrl={backdropImage}
              style={{
                inset: -60,
                width: 1104,
                height: 740,
                opacity: getBackdropOpacity(
                  RECAP_BACKDROP_OPACITY.bento,
                  custom,
                ),
                filter: `blur(${backdropBlur}px)`,
              }}
            />
            <div
              className={"absolute inset-0"}
              style={{
                background: `linear-gradient(to right, ${RECAP_COLORS.ground}D1 0%, ${RECAP_COLORS.ground}73 60%, ${RECAP_COLORS.ground}40 100%)`,
              }}
            />
          </>
        )}
        <div style={{ ...at(44, 44), ...monoStyle(26, RECAP_COLORS.cream) }}>
          {t("mobile.wrapped.card.topGame")}
        </div>
        <div
          className={"flex flex-col justify-end"}
          style={{ ...at(40, 262, 500, 228) }}
        >
          <div
            className={"line-clamp-2"}
            style={{
              ...displayStyle(
                Math.min(
                  124,
                  Math.max(60, Math.round(1500 / Math.max(topName.length, 1))),
                ),
                RECAP_COLORS.cream,
              ),
              letterSpacing: "-0.03em",
              overflowWrap: "anywhere",
            }}
          >
            {topName}
          </div>
        </div>
        <div
          className={"truncate"}
          style={{
            ...at(44, 520, 500),
            ...displayStyle(64, accent),
            letterSpacing: "-0.02em",
          }}
        >
          {top ? formatPlaytime(top.seconds) : "-"}
        </div>
        <div style={at(580, 56, 340, 454)}>
          <RecapCover
            game={top?.game}
            width={340}
            height={454}
            radius={26}
            style={{ boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)" }} // theme-exempt: recap card artwork shadow
          />
        </div>
        <div
          className={"absolute inset-0 pointer-events-none"}
          style={{
            borderRadius: 40,
            border: `2px solid ${RECAP_COLORS.cream}1A`,
          }}
        />
      </Tile>

      <Tile x={48} y={799} w={480} h={250} style={{ background: accent }}>
        <div style={{ ...at(36, 34), ...monoStyle(24, RECAP_COLORS.ink) }}>
          {t("mobile.wrapped.card.hoursPlayed")}
        </div>
        <div
          style={{
            ...at(32, 70, 420),
            ...displayStyle(fitFontSize(hoursText, 420, 150), RECAP_COLORS.ink),
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
        >
          {hoursText}
        </div>
        {showChange && (
          <div style={{ position: "absolute", right: 32, top: 26 }}>
            <RecapChange
              percent={figures.changePercent}
              size={22}
              style={{
                color: RECAP_COLORS.ink,
                background: `${RECAP_COLORS.ink}24`,
              }}
            />
          </div>
        )}
      </Tile>
      <Tile x={552} y={799} w={480} h={250}>
        <div style={{ ...at(36, 34), ...monoStyle(24) }}>
          {t("mobile.wrapped.card.gamesPlayed")}
        </div>
        <div
          style={{
            ...at(32, 70, 420),
            ...displayStyle(
              fitFontSize(gamesText, 420, 150),
              RECAP_COLORS.cream,
            ),
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
        >
          {gamesText}
        </div>
        {username && (
          <div
            className={"truncate"}
            style={{ ...at(36, 206, 408), ...monoStyle(20) }}
          >
            {username}
          </div>
        )}
      </Tile>

      {nextUp.length > 0 && (
        <Tile x={48} y={1073} w={984} h={480}>
          <div style={{ ...at(36, 34), ...monoStyle(24) }}>
            {t("mobile.wrapped.card.nextUp")}
          </div>
          {nextUp.map(({ game, seconds }, index) => {
            const x = 36 + index * 233;

            return (
              <div key={game?.id ?? index}>
                <div style={at(x, 84, 213, 284)}>
                  <RecapCover
                    game={game}
                    width={213}
                    height={284}
                    radius={20}
                    style={{ boxShadow: "0 12px 24px rgba(0, 0, 0, 0.45)" }} // theme-exempt: recap card artwork shadow
                  />
                </div>
                <div
                  style={{
                    ...at(x, 384),
                    ...displayStyle(28, accent),
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {index + 2}
                </div>
                <div
                  className={"truncate"}
                  style={{
                    ...at(x + 32, 384, 181),
                    ...displayStyle(28, RECAP_COLORS.cream, 600),
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                >
                  {game?.name ?? "-"}
                </div>
                <div style={{ ...at(x + 32, 424, 181), ...monoStyle(20) }}>
                  {formatPlaytime(seconds)}
                </div>
              </div>
            );
          })}
        </Tile>
      )}

      {smallStats.map(({ key, label, value }, index) => (
        <SmallStat
          key={key}
          x={GRID_X + index * (smallWidth + GAP)}
          width={smallWidth}
          label={label}
          value={value}
        />
      ))}

      <div style={{ ...at(48, 1830), ...monoStyle(22, RECAP_COLORS.dim) }}>
        {t("mobile.wrapped.card.madeOn")}
      </div>
    </div>
  );
}
