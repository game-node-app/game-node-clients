import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { RecapPlatformMark } from "#@/components/wrapped/card/RecapPlatformMark";
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
import { formatRecapChange } from "#@/components/wrapped/util/recapFigures";
import { RECAP_POSTER_HERO } from "#@/components/wrapped/card/recapPosterHero";
import {
  getBackdropOpacity,
  getRecapAccent,
  getRecapExtraStat,
  pickBackdropGame,
} from "#@/components/wrapped/card/recapCustomization";
import { useTranslation } from "@repo/locales";
import type { ReactNode } from "react";

function Stat({
  label,
  value,
  color = RECAP_COLORS.cream,
  size = 44,
  children,
}: {
  label: string;
  value?: string;
  color?: string;
  size?: number;
  children?: ReactNode;
}) {
  return (
    <div>
      <div style={monoStyle(20)}>{label}</div>
      <div style={{ marginTop: 8 }}>
        {children ?? (
          <div className={"line-clamp-2"} style={displayStyle(size, color)}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Poster (Story, 1080x1920), ported from Echo's "Cartaz": the user's name as
 * a giant headline on a brand-coloured block over the top game's art, then
 * the top game, a ranked list and the period figures.
 */
export function RecapPosterCard({
  username,
  periodText,
  summary,
  figures,
  games,
  custom,
  videoHero = false,
}: RecapCardProps & {
  /**
   * Video export mode: the card background and the hero block are transparent
   * (the encoder draws the background and the clip underneath) and the hero
   * text turns light, over a scrim, to stay readable on any footage.
   */
  videoHero?: boolean;
}) {
  const { t } = useTranslation();
  const ranked = getRankedGames(summary, games);
  const [top] = ranked;
  const accent = getRecapAccent(custom);
  const backdropGame = pickBackdropGame(ranked, custom);
  const extra = getRecapExtraStat(summary, custom);
  // Without a name the headline is just "WRAPPED" (no duplicated line).
  const name = (username ?? "").trim().toUpperCase();
  const innerWidth = 860;

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: videoHero
          ? "transparent"
          : `radial-gradient(900px 900px at 50% 90%, ${accent}38, transparent), ${RECAP_COLORS.ground}`,
        color: RECAP_COLORS.cream,
      }}
    >
      <div style={at(60, 150)}>
        <GameNodeLogo style={{ width: 200 }} />
      </div>
      <div
        style={{ ...at(520, 168, 500), ...monoStyle(34), textAlign: "right" }}
      >
        {periodText}
      </div>

      <div
        className={"overflow-hidden"}
        style={{
          ...at(
            RECAP_POSTER_HERO.x,
            RECAP_POSTER_HERO.y,
            RECAP_POSTER_HERO.width,
            RECAP_POSTER_HERO.height
          ),
          borderRadius: RECAP_POSTER_HERO.radius,
          background: videoHero ? "transparent" : accent,
        }}
      >
        {videoHero ? (
          <div
            className={"absolute inset-0"}
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,10,9,0) 35%, rgba(11,10,9,0.78) 100%)",
            }}
          />
        ) : (
          <RecapBackdrop
            game={backdropGame}
            style={{
              opacity: getBackdropOpacity(0.32, custom),
              mixBlendMode: "multiply",
              filter: "grayscale(0.4)",
            }}
          />
        )}
        {videoHero ? (
          // Over footage the giant WRAPPED would fight the clip: only the
          // name, smaller, with the period right under it.
          <div
            className={"flex flex-col justify-end"}
            style={{ ...at(48, 0, 864, 800), paddingBottom: 56, gap: 16 }}
          >
            {name && (
              <div
                style={{
                  ...displayStyle(
                    fitFontSize(name, innerWidth, 120),
                    RECAP_COLORS.cream
                  ),
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </div>
            )}
            <div style={monoStyle(34, RECAP_COLORS.cream)}>{periodText}</div>
          </div>
        ) : (
          <>
            <div
              style={{
                ...at(48, 36),
                ...displayStyle(192, `${RECAP_COLORS.ink}26`),
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              {t("mobile.wrapped.card.wrapped")}
            </div>
            <div
              className={"flex flex-col justify-end"}
              style={{ ...at(48, 0, 864, 800), paddingBottom: 124 }}
            >
              {name && (
                <div
                  style={{
                    ...displayStyle(
                      fitFontSize(name, innerWidth, 300),
                      RECAP_COLORS.ink
                    ),
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </div>
              )}
              <div
                style={{
                  ...displayStyle(
                    fitFontSize("WRAPPED", innerWidth, 192),
                    RECAP_COLORS.ink
                  ),
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >
                {t("mobile.wrapped.card.wrapped")}
              </div>
            </div>
            <div
              style={{
                ...at(56, 704),
                ...monoStyle(30, RECAP_COLORS.ink),
              }}
            >
              {periodText}
            </div>
          </>
        )}
      </div>

      <div style={{ ...at(70, 1124), ...monoStyle(28, "#9B938A") }}>
        {t("mobile.wrapped.card.topGame")}
      </div>
      <div
        className={"line-clamp-2"}
        style={{
          ...at(66, 1166, 950),
          ...displayStyle(
            fitFontSize(top?.game?.name ?? "-", 950, 118),
            RECAP_COLORS.cream
          ),
        }}
      >
        {top?.game?.name ?? "-"}
      </div>

      <div className={"flex flex-col"} style={{ ...at(70, 1340, 520), gap: 4 }}>
        {ranked.slice(0, 5).map(({ game, seconds }, index) => (
          <div
            key={game?.id ?? index}
            className={"flex items-center"}
            style={{ height: 86, gap: 20 }}
          >
            <span
              style={{
                ...displayStyle(48, index === 0 ? accent : "#4A423B"),
                width: 44,
              }}
            >
              {index + 1}
            </span>
            <RecapCover game={game} width={56} height={74} radius={10} />
            <div className={"min-w-0 flex-1"}>
              <div
                className={"truncate"}
                style={{
                  ...displayStyle(30, RECAP_COLORS.cream, 600),
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {game?.name ?? "-"}
              </div>
              <div
                style={{
                  ...monoStyle(19, RECAP_COLORS.muted, false),
                  marginTop: 4,
                }}
              >
                {formatPlaytime(seconds)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={"flex flex-col justify-between"}
        style={{ ...at(650, 1346, 370, 430) }}
      >
        <Stat
          label={t("mobile.wrapped.card.hoursPlayed")}
          value={`${formatHours(figures.hours)}h`}
          color={accent}
          size={104}
        />
        <Stat
          label={t("mobile.wrapped.card.gamesPlayed")}
          value={`${figures.games}`}
          size={56}
        />
        {custom?.showComparison ? (
          <Stat
            label={t("mobile.wrapped.card.comparison")}
            value={formatRecapChange(figures.changePercent)}
            size={56}
          />
        ) : (
          <Stat label={t(extra.labelKey)} value={extra.value} size={56} />
        )}
        <Stat label={t("mobile.wrapped.card.topPlatform")}>
          <RecapPlatformMark name={summary.topPlatform?.name} size={34} />
        </Stat>
      </div>

      <div style={{ ...at(60, 1834), ...monoStyle(26, "#6F665B") }}>
        {t("mobile.wrapped.card.madeOn")}
      </div>
    </div>
  );
}
