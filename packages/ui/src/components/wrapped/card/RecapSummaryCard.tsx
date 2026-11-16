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
import {
  getPlatformIconName,
  getPlatformShortName,
} from "#@/components/wrapped/util/recapPlatform";
import { getServerStoredIcon } from "#@/util";
import { useTranslation } from "@repo/locales";
import type { CSSProperties, ReactNode } from "react";

/** Backdrop art opacity of the Figma design, used when the user has no choice. */
const TRUNCATE: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Largest mono size (up to `max`) that keeps `text` on one line in `width`. */
function fitMonoSize(text: string, width: number, max: number): number {
  return Math.min(max, Math.floor(width / (0.66 * Math.max(text.length, 1))));
}

function Stat({
  y,
  label,
  children,
}: {
  y: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        ...at(1167, y, 377, 80),
        boxSizing: "border-box",
        borderRadius: 22,
        background: "rgba(28,26,24,0.9)",
        border: "2px solid rgba(244,239,232,0.08)",
      }}
    >
      <div style={{ ...at(22, 10, 330), ...monoStyle(15), ...TRUNCATE }}>
        {label}
      </div>
      <div
        style={{
          ...at(22, 32, 330, 36),
          display: "flex",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const statValueStyle: CSSProperties = {
  ...displayStyle(36, RECAP_COLORS.cream),
  minWidth: 0,
  ...TRUNCATE,
};

function RankedTile({
  game,
  rank,
  x,
  y,
  accent,
}: {
  game: ReturnType<typeof getRankedGames>[number]["game"];
  rank: number;
  x: number;
  y: number;
  accent: string;
}) {
  return (
    <div
      className={"overflow-hidden"}
      style={{
        ...at(x, y, 181, 241),
        borderRadius: 24,
        boxShadow: "0 16px 32px rgba(0,0,0,0.5)",
      }}
    >
      <RecapCover game={game} width={181} height={241} radius={0} />
      <div
        className={"absolute inset-x-0 bottom-0"}
        style={{
          height: 92,
          background:
            "linear-gradient(to bottom, rgba(11,10,9,0), rgba(11,10,9,0.85))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 16,
          bottom: 20,
          width: 149,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            ...displayStyle(20, accent),
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            flexShrink: 0,
          }}
        >
          {rank}
        </span>
        <span
          style={{
            ...displayStyle(20, RECAP_COLORS.cream, 600),
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            minWidth: 0,
            ...TRUNCATE,
          }}
        >
          {game?.name ?? "-"}
        </span>
      </div>
    </div>
  );
}

/**
 * Feed summary (1600x900): the hours figure on the left, the top game as a
 * large cover and the next four in a grid on the right, with the stat rows
 * below the grid. The Story templates (Poster, Dash, Bento) have their own
 * components.
 */
export function RecapSummaryCard({
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
  const [top, ...others] = ranked;
  const accent = getRecapAccent(custom);
  const extra = getRecapExtraStat(summary, custom);
  const showExtra = Number(extra.value) > 0;
  const change = custom?.showComparison ? figures.changePercent : null;

  const topName = top?.game?.name ?? "-";
  const topNameSize = Math.min(
    64,
    Math.round(559 / (0.55 * Math.max(topName.length, 1))),
  );

  const hoursText = `${formatHours(figures.hours)}h`;
  const hoursSize = Math.min(
    270,
    Math.floor(500 / (0.5 * Math.max(hoursText.length, 1))),
  );

  const name = (username ?? "").trim().toUpperCase();
  const wrapped = t("mobile.wrapped.card.wrapped").toUpperCase();
  const nameLabel = name ? `${name} · ${wrapped}` : wrapped;

  const caption = t("mobile.wrapped.card.playedAcross", {
    count: figures.games,
  });

  const platformName = getPlatformShortName(summary.topPlatform?.name) ?? "-";
  const platformIcon = getPlatformIconName(summary.topPlatform?.name);
  const backdropGame = pickBackdropGame(ranked, custom);
  const backdropImage = pickBackdropImage(backdropGame, custom);
  const backdropBlur = getBackdropBlur(RECAP_BACKDROP_BLUR.summary, custom);

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: media?.video ? "transparent" : RECAP_COLORS.ground,
        color: RECAP_COLORS.cream,
      }}
    >
      {hasRecapMedia(media) ? (
        <RecapMediaLayer media={media} template={"summary"} />
      ) : (
        <>
          <div
            style={{
              ...at(-120, -120, 1500, 1140),
              filter: `blur(${backdropBlur}px)`,
              opacity: getBackdropOpacity(
                RECAP_BACKDROP_OPACITY.summary,
                custom,
              ),
            }}
          >
            <RecapBackdrop game={backdropGame} imageUrl={backdropImage} />
          </div>
          <div
            className={"absolute inset-0"}
            style={{
              background:
                "linear-gradient(to bottom, rgba(15,14,13,0.5) 0%, rgba(15,14,13,0.82) 40%, rgba(15,14,13,0.92) 100%)",
            }}
          />
        </>
      )}

      <div style={at(56, 60)}>
        <GameNodeLogo style={{ width: 201 }} />
      </div>
      <div
        style={{
          ...at(314, 54, undefined, 52),
          boxSizing: "border-box",
          maxWidth: 232,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderRadius: 999,
          background: "rgba(15,14,13,0.6)",
          border: "2px solid rgba(244,239,232,0.2)",
          ...monoStyle(fitMonoSize(periodText, 192, 22), RECAP_COLORS.cream),
          whiteSpace: "nowrap",
        }}
      >
        {periodText}
      </div>

      <div
        style={{
          ...at(56, 152, 480),
          ...monoStyle(fitMonoSize(nameLabel, 480, 22), RECAP_COLORS.cream),
          ...TRUNCATE,
        }}
      >
        {nameLabel}
      </div>

      <div
        style={{
          ...at(48, 196, 512),
          ...displayStyle(hoursSize, accent),
          letterSpacing: "-0.04em",
          whiteSpace: "nowrap",
        }}
      >
        {hoursText}
      </div>
      <div
        style={{
          ...at(56, 470, 464),
          ...displayStyle(46, RECAP_COLORS.cream, 600),
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          textWrap: "balance",
        }}
      >
        {caption}
      </div>
      {change != null && (
        <RecapChange
          percent={change}
          size={22}
          style={{ ...at(56, 586), width: "fit-content" }}
        />
      )}

      <div style={{ ...at(56, 826), ...monoStyle(18, RECAP_COLORS.dim) }}>
        {t("mobile.wrapped.card.madeOn")}
      </div>

      <div
        className={"overflow-hidden"}
        style={{
          ...at(560, 56, 591, 788),
          borderRadius: 36,
          boxShadow: "0 16px 32px rgba(0,0,0,0.5)",
        }}
      >
        <RecapCover game={top?.game} width={591} height={788} radius={0} />
        <div
          className={"absolute inset-x-0 bottom-0"}
          style={{
            height: 299,
            background:
              "linear-gradient(to bottom, rgba(11,10,9,0), rgba(11,10,9,0.85))",
          }}
        />
        <div
          style={{
            ...at(14, 14, 56, 56),
            borderRadius: 28,
            background: "rgba(11,10,9,0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...displayStyle(32, RECAP_COLORS.cream),
            letterSpacing: 0,
            lineHeight: 1,
          }}
        >
          1
        </div>
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 52,
            width: 559,
            ...displayStyle(topNameSize, RECAP_COLORS.cream, 600),
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            ...TRUNCATE,
          }}
        >
          {topName}
        </div>
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            ...monoStyle(22, RECAP_COLORS.cream),
            opacity: 0.75,
          }}
        >
          {top ? formatPlaytime(top.seconds) : "-"}
        </div>
      </div>

      {others.slice(0, 4).map(({ game }, index) => (
        <RankedTile
          key={game?.id ?? index}
          game={game}
          rank={index + 2}
          x={1167 + (index % 2) * 196}
          y={56 + Math.floor(index / 2) * 256}
          accent={accent}
        />
      ))}

      <Stat y={580} label={t("mobile.wrapped.card.gamesPlayed")}>
        <span style={statValueStyle}>{figures.games}</span>
      </Stat>
      <Stat y={672} label={t("mobile.wrapped.card.topGenre")}>
        <span style={statValueStyle}>{summary.topGenre?.name ?? "-"}</span>
      </Stat>
      {showExtra ? (
        <Stat y={764} label={t(extra.labelKey)}>
          <span style={statValueStyle}>{extra.value}</span>
        </Stat>
      ) : (
        <Stat y={764} label={t("mobile.wrapped.card.topPlatform")}>
          {platformIcon && (
            <img
              src={getServerStoredIcon(platformIcon)}
              alt={""}
              className={"shrink-0 pointer-events-none"}
              style={{
                width: 32,
                height: 32,
                marginRight: 10,
                objectFit: "contain",
              }}
            />
          )}
          <span style={statValueStyle}>{platformName}</span>
        </Stat>
      )}
    </div>
  );
}
