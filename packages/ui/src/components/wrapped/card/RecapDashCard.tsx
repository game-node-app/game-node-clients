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

const COVER_WIDTH = 304;
const COVER_HEIGHT = 420;
const COVER_GAP = 24;
const COVER_RADIUS = 28;
const COVERS_TOP = 900;
const CONTENT_LEFT = 60;
const CONTENT_WIDTH = 960;
const STATS_TOP = 1690;
const STATS_HEIGHT = 170;
const STATS_GAP = 30;
const STAT_PADDING_X = 28;

function StatTile({
  x,
  width,
  value,
  label,
}: {
  x: number;
  width: number;
  value: string;
  label: string;
}) {
  const innerWidth = width - STAT_PADDING_X * 2;
  // Mono advance is ~0.612em plus the 0.06em tracking.
  const labelSize = Math.min(
    20,
    Math.floor(innerWidth / (0.68 * Math.max(label.length, 1))),
  );

  return (
    <div
      style={{
        ...at(x, STATS_TOP, width, STATS_HEIGHT),
        borderRadius: 28,
        background: "rgba(28, 26, 24, 0.92)",
        border: "2px solid rgba(244, 239, 232, 0.08)",
        padding: `22px ${STAT_PADDING_X - 2}px`,
      }}
      className={"flex flex-col justify-between overflow-hidden"}
    >
      <div
        className={"truncate"}
        style={displayStyle(
          Math.max(28, fitFontSize(value, innerWidth, 60)),
          RECAP_COLORS.cream,
        )}
      >
        {value}
      </div>
      <div
        className={"truncate"}
        style={{ ...monoStyle(labelSize), whiteSpace: "nowrap" }}
      >
        {label}
      </div>
    </div>
  );
}

/**
 * Dash (Story, 1080x1920): the hours figure over the blurred art of a top
 * game, the three most played games as covers, ranks 4 and 5 as rows and a
 * group of stat tiles.
 */
export function RecapDashCard({
  periodText,
  summary,
  figures,
  games,
  custom,
  media,
}: RecapCardProps) {
  const { t } = useTranslation();
  const ranked = getRankedGames(summary, games).slice(0, 5);
  const podium = ranked.slice(0, 3);
  const rows = ranked.slice(3, 5);
  const accent = getRecapAccent(custom);
  const backdropGame = pickBackdropGame(ranked, custom);
  const backdropImage = pickBackdropImage(backdropGame, custom);
  const backdropBlur = getBackdropBlur(RECAP_BACKDROP_BLUR.dash, custom);
  const extra = getRecapExtraStat(summary, custom);
  const change = custom?.showComparison ? figures.changePercent : null;

  const hoursText = formatHours(figures.hours);
  const hoursSize = Math.max(160, fitFontSize(hoursText, 960, 400));

  const tiles = [
    {
      key: "games",
      value: `${figures.games}`,
      label: t("mobile.wrapped.card.gamesPlayed"),
    },
    {
      key: "genre",
      value: summary.topGenre?.name ?? "-",
      label: t("mobile.wrapped.card.topGenre"),
    },
    {
      key: "platform",
      value: getPlatformShortName(summary.topPlatform?.name) ?? "-",
      label: t("mobile.wrapped.card.topPlatform"),
    },
  ];
  if (Number(extra.value) > 0) {
    tiles.push({
      key: "extra",
      value: extra.value,
      label: t(extra.labelKey),
    });
  }
  const tileWidth =
    (CONTENT_WIDTH - STATS_GAP * (tiles.length - 1)) / tiles.length;

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: media?.video ? "transparent" : RECAP_COLORS.ground,
        color: RECAP_COLORS.cream,
      }}
    >
      {hasRecapMedia(media) ? (
        <RecapMediaLayer media={media} template={"dash"} />
      ) : (
        <>
          <div style={at(-120, -120, 1320, 1300)}>
            <RecapBackdrop
              game={backdropGame}
              imageUrl={backdropImage}
              style={{
                opacity: getBackdropOpacity(
                  RECAP_BACKDROP_OPACITY.dash,
                  custom,
                ),
                filter: `blur(${backdropBlur}px)`,
              }}
            />
          </div>
          <div
            style={{
              ...at(0, 0, 1080, 1250),
              background:
                "linear-gradient(to bottom, rgba(15,14,13,0.1) 0%, rgba(15,14,13,0.45) 50%, rgba(15,14,13,1) 100%)",
            }}
          />
        </>
      )}

      <div style={at(60, 110)}>
        <GameNodeLogo style={{ width: 150 }} />
      </div>
      <div
        className={"flex items-center"}
        style={{
          position: "absolute",
          top: 104,
          right: 60,
          boxSizing: "content-box",
          padding: "12px 22px",
          border: "2px solid rgba(244, 239, 232, 0.2)",
          borderRadius: 999,
          background: "rgba(15, 14, 13, 0.6)",
        }}
      >
        <span
          style={{
            ...monoStyle(26, RECAP_COLORS.cream),
            whiteSpace: "nowrap",
          }}
        >
          {periodText}
        </span>
      </div>

      <div
        style={{
          ...at(56, 214),
          ...displayStyle(88, "rgba(244, 239, 232, 0.7)"),
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
        }}
      >
        {t("mobile.wrapped.card.youPlayed")}
      </div>
      <div
        style={{
          ...at(48, 298 + (400 - hoursSize) * 0.46),
          ...displayStyle(hoursSize, accent),
          letterSpacing: "-0.04em",
          whiteSpace: "nowrap",
        }}
      >
        {hoursText}
      </div>
      <div
        style={{
          ...at(56, 660),
          ...displayStyle(88, RECAP_COLORS.cream),
          whiteSpace: "nowrap",
        }}
      >
        {t("mobile.wrapped.card.hoursUnit")}
      </div>
      {change != null && (
        <div
          className={"flex items-center"}
          style={at(310, 660, undefined, 81)}
        >
          <RecapChange percent={change} size={28} />
        </div>
      )}

      <div style={{ ...at(CONTENT_LEFT, 852), ...monoStyle(26) }}>
        {t("mobile.wrapped.card.topGames")}
      </div>
      {podium.map(({ game, seconds }, index) => {
        const x = CONTENT_LEFT + index * (COVER_WIDTH + COVER_GAP);

        return (
          <div key={game?.id ?? index}>
            <RecapCover
              game={game}
              width={COVER_WIDTH}
              height={COVER_HEIGHT}
              radius={COVER_RADIUS}
              style={{
                position: "absolute",
                left: x,
                top: COVERS_TOP,
                boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
              }}
            />
            <div
              style={{
                ...at(x, COVERS_TOP + 180, COVER_WIDTH, 240),
                borderRadius: COVER_RADIUS,
                background:
                  "linear-gradient(to bottom, rgba(11,10,9,0) 0%, rgba(11,10,9,0.78) 100%)",
              }}
            />
            <div
              style={{
                ...at(x + 10, 1186),
                ...displayStyle(150, RECAP_COLORS.cream),
                letterSpacing: "-0.04em",
                textShadow: "0 4px 16px rgba(0, 0, 0, 0.6)",
              }}
            >
              {index + 1}
            </div>
            <div
              className={"truncate"}
              style={{
                ...at(x, 1340, COVER_WIDTH),
                ...displayStyle(34, RECAP_COLORS.cream, 600),
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              {game?.name ?? "-"}
            </div>
            <div style={{ ...at(x, 1386), ...monoStyle(24) }}>
              {formatPlaytime(seconds)}
            </div>
          </div>
        );
      })}

      {rows.map(({ game, seconds }, index) => (
        <div
          key={game?.id ?? index}
          className={"flex items-center"}
          style={{
            ...at(CONTENT_LEFT, 1462 + index * 94, CONTENT_WIDTH, 74),
            gap: 24,
          }}
        >
          <span
            className={"shrink-0"}
            style={{
              ...displayStyle(44, RECAP_COLORS.dim),
              width: 44,
            }}
          >
            {index + 4}
          </span>
          <RecapCover game={game} width={56} height={74} radius={10} />
          <div
            className={"min-w-0 flex-1 truncate"}
            style={{
              ...displayStyle(38, RECAP_COLORS.cream, 600),
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            {game?.name ?? "-"}
          </div>
          <div
            className={"shrink-0"}
            style={{ ...monoStyle(26), whiteSpace: "nowrap" }}
          >
            {formatPlaytime(seconds)}
          </div>
        </div>
      ))}

      {tiles.map((tile, index) => (
        <StatTile
          key={tile.key}
          x={CONTENT_LEFT + index * (tileWidth + STATS_GAP)}
          width={tileWidth}
          value={tile.value}
          label={tile.label}
        />
      ))}
    </div>
  );
}
