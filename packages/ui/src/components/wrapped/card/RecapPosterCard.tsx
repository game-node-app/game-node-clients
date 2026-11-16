import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { RecapChange } from "#@/components/wrapped/card/RecapChange";
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
  hasRecapMedia,
  RecapMediaLayer,
} from "#@/components/wrapped/card/RecapMediaLayer";
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
import { getPlatformShortName } from "#@/components/wrapped/util/recapPlatform";
import { useTranslation } from "@repo/locales";

const GROUND = "15, 14, 13";
const COVER_SHADOW = "0 28px 56px rgba(0, 0, 0, 0.5)";
const THUMB_SHADOW = "0 14px 32px rgba(0, 0, 0, 0.45)";

/** Font size that keeps `text` inside `width`, between `min` and `max`. */
function fitText(text: string, width: number, max: number, min: number) {
  const fit = Math.round(width / (0.55 * Math.max(text.length, 1)));
  return Math.max(min, Math.min(max, fit));
}

function InfoStat({
  label,
  value,
  x,
  width,
  platform = false,
  compact = false,
}: {
  label: string;
  value: string;
  x: number;
  width: number;
  /** Draws the value as a platform (icon and short name). */
  platform?: boolean;
  /** Smaller label, for the three-column row. */
  compact?: boolean;
}) {
  const size = fitText(value, width, 52, 34);
  return (
    <div style={at(x, 1142, width)}>
      <div className={"truncate"} style={monoStyle(compact ? 20 : 22)}>
        {label}
      </div>
      {platform ? (
        <div style={{ marginTop: 8 }}>
          <RecapPlatformMark name={value} size={size} />
        </div>
      ) : (
        <div
          className={"line-clamp-2"}
          style={{
            ...displayStyle(size, RECAP_COLORS.cream),
            marginTop: 8,
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
}

/**
 * Poster (Story, 1080x1920): the period's hours as the hero over a blurred
 * cover of the top game, then the top game with its cover, the genre and
 * platform, and the next four games as a row of covers.
 */
export function RecapPosterCard({
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
  const accent = getRecapAccent(custom);
  const backdropGame = pickBackdropGame(ranked, custom);
  const backdropImage = pickBackdropImage(backdropGame, custom);
  const backdropBlur = getBackdropBlur(RECAP_BACKDROP_BLUR.poster, custom);
  const extra = getRecapExtraStat(summary, custom);
  const showExtra = Number(extra.value) > 0;
  // Without a name the label is just "WRAPPED" (no duplicated line).
  const name = (username ?? "").trim();
  const wrapped = t("mobile.wrapped.card.wrapped");
  const label = name ? `${name} · ${wrapped}` : wrapped;

  const hours = `${formatHours(figures.hours)}h`;
  const hoursSize = Math.min(
    330,
    Math.round(960 / (0.5 * Math.max(hours.length, 1))),
  );
  const topName = top?.game?.name ?? "-";
  const topNameSingleLine = 504 / (0.55 * topName.length) >= 64;
  const topNameSize = topNameSingleLine ? fitText(topName, 504, 104, 64) : 60;
  const share = figures.games > 1 ? figures.topGameSharePercent : null;

  const columns = showExtra ? 3 : 2;
  const columnWidth = showExtra ? 156 : 236;
  const columnGap = showExtra ? 16 : 28;
  const stats = [
    {
      label: t("mobile.wrapped.card.topGenre"),
      value: summary.topGenre?.name || "-",
    },
    {
      label: t("mobile.wrapped.card.topPlatform"),
      value: getPlatformShortName(summary.topPlatform?.name) ?? "-",
      platform: true,
    },
    ...(showExtra ? [{ label: t(extra.labelKey), value: extra.value }] : []),
  ].slice(0, columns);

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: media?.video ? "transparent" : RECAP_COLORS.ground,
        color: RECAP_COLORS.cream,
      }}
    >
      {hasRecapMedia(media) ? (
        <RecapMediaLayer media={media} template={"poster"} />
      ) : (
        <>
          <div style={at(-120, -120, 1320, 1340)}>
            <RecapBackdrop
              game={backdropGame}
              imageUrl={backdropImage}
              style={{
                opacity: getBackdropOpacity(
                  RECAP_BACKDROP_OPACITY.poster,
                  custom,
                ),
                filter: `blur(${backdropBlur}px)`,
              }}
            />
          </div>
          <div
            style={{
              ...at(0, 0, 1080, 1300),
              background: `linear-gradient(to bottom, rgba(${GROUND}, 0.1) 0%, rgba(${GROUND}, 0.45) 50%, rgba(${GROUND}, 1) 100%)`,
            }}
          />
        </>
      )}

      <div style={at(60, 150)}>
        <GameNodeLogo style={{ width: 200 }} />
      </div>
      <div className={"flex justify-end"} style={at(520, 144, 500)}>
        <div
          style={{
            ...monoStyle(26, RECAP_COLORS.cream),
            padding: "12px 22px",
            border: `2px solid ${RECAP_COLORS.cream}`,
            borderRadius: 999,
            background: `rgba(${GROUND}, 0.6)`,
            whiteSpace: "nowrap",
          }}
        >
          {periodText}
        </div>
      </div>

      <div
        className={"truncate"}
        style={{ ...at(60, 262, 960), ...monoStyle(30, RECAP_COLORS.cream) }}
      >
        {label}
      </div>
      {/* The hours sit on the bottom of a fixed box, so the line under them
          keeps its place whatever the size of the figure. */}
      <div
        className={"flex items-end"}
        style={{ ...at(48, 300, 984, 304), whiteSpace: "nowrap" }}
      >
        <div
          style={{
            ...displayStyle(hoursSize, accent),
            letterSpacing: "-0.04em",
          }}
        >
          {hours}
        </div>
      </div>
      <div
        className={"flex items-center"}
        style={{ ...at(60, 596, 960), gap: 24 }}
      >
        <div
          style={{
            ...displayStyle(50, RECAP_COLORS.cream, 600),
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          {t("mobile.wrapped.card.playedAcross", { count: figures.games })}
        </div>
        {custom?.showComparison && figures.changePercent != null && (
          <RecapChange percent={figures.changePercent} size={26} />
        )}
      </div>

      <RecapCover
        game={top?.game}
        width={405}
        height={540}
        radius={28}
        style={{ ...at(60, 690), boxShadow: COVER_SHADOW }}
      />
      <div style={{ ...at(520, 696), ...monoStyle(26) }}>
        {t("mobile.wrapped.card.topGame")}
      </div>
      <div
        className={topNameSingleLine ? "whitespace-nowrap" : "line-clamp-2"}
        style={{
          ...at(516, 736, 504, topNameSingleLine ? undefined : 122),
          ...displayStyle(topNameSize, RECAP_COLORS.cream),
        }}
      >
        {topName}
      </div>
      <div style={{ ...at(520, 858), ...displayStyle(84, accent) }}>
        {formatPlaytime(top?.seconds ?? 0)}
      </div>
      {share != null && (
        // The room under the top game's time: how much of the period it took.
        <div style={at(520, 990, 500)}>
          <div style={monoStyle(26, RECAP_COLORS.cream)}>
            {t("mobile.wrapped.card.topGameShare", { percent: share })}
          </div>
          <div
            style={{
              marginTop: 18,
              height: 14,
              borderRadius: 7,
              background: `${RECAP_COLORS.cream}24`,
            }}
          >
            <div
              style={{
                width: `${share}%`,
                height: "100%",
                borderRadius: 7,
                background: accent,
              }}
            />
          </div>
        </div>
      )}
      <div
        style={{
          ...at(520, 1110, 500, 2),
          background: `${RECAP_COLORS.cream}24`,
        }}
      />
      {stats.map((stat, index) => (
        <InfoStat
          key={stat.label}
          label={stat.label}
          value={stat.value}
          platform={"platform" in stat && stat.platform}
          compact={showExtra}
          x={520 + index * (columnWidth + columnGap)}
          width={columnWidth}
        />
      ))}

      {ranked.length > 1 && (
        <div style={{ ...at(60, 1296), ...monoStyle(26) }}>
          {t("mobile.wrapped.card.nextUp")}
        </div>
      )}
      {ranked.slice(1, 5).map(({ game, seconds }, index) => {
        const x = 60 + index * 250;
        return (
          <div key={game?.id ?? index}>
            <RecapCover
              game={game}
              width={210}
              height={280}
              radius={22}
              style={{ ...at(x, 1342), boxShadow: THUMB_SHADOW }}
            />
            <div
              style={{
                ...at(x, 1640),
                ...displayStyle(30, accent),
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {index + 2}
            </div>
            <div
              className={"truncate"}
              style={{
                ...at(x + 35, 1640, 175),
                ...displayStyle(30, RECAP_COLORS.cream, 600),
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              {game?.name ?? "-"}
            </div>
            <div style={{ ...at(x + 35, 1684), ...monoStyle(22) }}>
              {formatPlaytime(seconds)}
            </div>
          </div>
        );
      })}

      <div style={{ ...at(60, 1830), ...monoStyle(22, RECAP_COLORS.dim) }}>
        {t("mobile.wrapped.card.madeOn")}
      </div>
    </div>
  );
}
