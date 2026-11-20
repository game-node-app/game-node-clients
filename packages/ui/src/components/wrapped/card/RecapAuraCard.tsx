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
import { getPlatformShortName } from "#@/components/wrapped/util/recapPlatform";
import { useTranslation } from "@repo/locales";

const COVER_WIDTH = 230;
const COVER_PITCH = 240;

/**
 * Tilt and vertical offset per cover, so the row feels hand-placed. Each count
 * has its own set: the four-cover composition is the reference, fewer covers
 * keep the same stagger instead of leaving the row left-heavy.
 */
const COVER_LAYOUTS = [
  [],
  [{ tilt: -3, top: 262 }],
  [
    { tilt: -5, top: 270 },
    { tilt: 4, top: 244 },
  ],
  [
    { tilt: -6, top: 270 },
    { tilt: 3, top: 240 },
    { tilt: -3, top: 274 },
  ],
  [
    { tilt: -6, top: 270 },
    { tilt: 3, top: 240 },
    { tilt: -2, top: 280 },
    { tilt: 5, top: 250 },
  ],
] as const;

/**
 * Position of each cover in the row. The row is centred on the same axis as
 * the four-cover row (x = 60 for four), so 1 to 3 games stay balanced.
 */
export function getAuraCoverLayout(
  count: number,
): { left: number; top: number; tilt: number }[] {
  const size = Math.min(Math.max(count, 0), 4);
  const left = 60 + ((4 - size) * COVER_PITCH) / 2;
  return COVER_LAYOUTS[size]!.map(({ tilt, top }, index) => ({
    left: left + index * COVER_PITCH,
    top,
    tilt,
  }));
}

const GLASS_WIDTH = 468;
const GLASS_HEIGHT = 236;

/** `#RRGGBB` plus an alpha, as a CSS color. Falls back to the input. */
function withAlpha(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const value = parseInt(match[1]!, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function GlassCard({
  x,
  y,
  label,
  value,
  accent,
}: {
  accent: string;
  x: number;
  y: number;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        ...at(x, y, GLASS_WIDTH, GLASS_HEIGHT),
        boxSizing: "border-box",
        borderRadius: 44,
        background: `${RECAP_COLORS.panel}E6`,
        border: `2px solid ${RECAP_COLORS.cream}1A`,
      }}
    >
      <div
        className={"truncate"}
        style={{
          ...at(40, 36, GLASS_WIDTH - 80),
          ...monoStyle(22, accent),
        }}
      >
        {label}
      </div>
      <div
        className={"line-clamp-2"}
        style={{
          ...at(40, 86, GLASS_WIDTH - 80),
          ...displayStyle(52, RECAP_COLORS.cream, 800),
          lineHeight: 1.08,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Aura (Story, 1080x1920): a warm brand-colored glow on the dark ground behind
 * a tilted row of the top four covers, the hours as a huge accent figure and
 * four panel tiles.
 */
export function RecapAuraCard({
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
  const covers = ranked.slice(0, 4);
  const coverLayout = getAuraCoverLayout(covers.length);
  const accent = getRecapAccent(custom);
  const backdropGame = pickBackdropGame(ranked, custom);
  const backdropImage = pickBackdropImage(backdropGame, custom);
  const backdropBlur = getBackdropBlur(RECAP_BACKDROP_BLUR.aura, custom);
  const extra = getRecapExtraStat(summary, custom);
  const showChange = !!custom?.showComparison && figures.changePercent != null;
  const hoursText = `${formatHours(figures.hours)}h`;
  const hoursSize = fitFontSize(hoursText, 960, 380);

  const tiles = [
    {
      key: "top",
      label: t("mobile.wrapped.card.topGame"),
      value: ranked[0]?.game?.name ?? "-",
    },
    {
      key: "second",
      label: t("mobile.wrapped.card.secondGame"),
      value: ranked[1]?.game?.name ?? "-",
    },
    {
      key: "genre",
      label: t("mobile.wrapped.card.topGenre"),
      value: summary.topGenre?.name || "-",
    },
    Number(extra.value) > 0
      ? { key: "extra", label: t(extra.labelKey), value: extra.value }
      : {
          key: "platform",
          label: t("mobile.wrapped.card.topPlatform"),
          value: getPlatformShortName(summary.topPlatform?.name) ?? "-",
        },
  ];

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: media?.video ? "transparent" : RECAP_COLORS.ground,
        color: RECAP_COLORS.cream,
      }}
    >
      {hasRecapMedia(media) ? (
        <RecapMediaLayer media={media} template={"aura"} />
      ) : (
        <>
          <div
            style={{
              ...at(-60, -60, 1200, 2040),
              filter: `blur(${backdropBlur}px)`,
              opacity: getBackdropOpacity(RECAP_BACKDROP_OPACITY.aura, custom),
            }}
          >
            <RecapBackdrop game={backdropGame} imageUrl={backdropImage} />
          </div>
          <div
            className={"absolute inset-0"}
            style={{
              background: [
                `radial-gradient(circle 820px at 100px 260px, ${withAlpha(accent, 0.75)}, ${withAlpha(accent, 0)} 72%)`,
                `radial-gradient(circle 700px at 1000px 1500px, ${withAlpha(accent, 0.3)}, ${withAlpha(accent, 0)} 72%)`,
                `linear-gradient(to bottom, ${withAlpha(RECAP_COLORS.ground, 0.6)}, ${withAlpha(RECAP_COLORS.ground, 0.82)})`,
              ].join(", "),
            }}
          />
        </>
      )}

      <div style={at(60, 100)}>
        <GameNodeLogo style={{ width: 200 }} />
      </div>
      <div
        className={"truncate"}
        style={{
          ...at(560, 124, 460),
          ...monoStyle(30, RECAP_COLORS.cream),
          textAlign: "right",
        }}
      >
        {periodText}
      </div>

      {covers.map(({ game }, index) => (
        <div
          key={game?.id ?? index}
          style={{
            ...at(
              coverLayout[index]!.left,
              coverLayout[index]!.top,
              COVER_WIDTH,
              306,
            ),
            transform: `rotate(${coverLayout[index]!.tilt}deg)`,
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
            border: `3px solid ${RECAP_COLORS.cream}33`,
            borderRadius: 30,
          }}
        >
          <RecapCover
            game={game}
            width={COVER_WIDTH}
            height={306}
            radius={30}
          />
        </div>
      ))}

      <div
        style={{
          ...at(56, 650, 980),
          ...displayStyle(hoursSize, accent, 800),
          letterSpacing: "-0.045em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {hoursText}
      </div>
      <div
        style={{
          ...at(64, 1030, 940),
          ...displayStyle(66, RECAP_COLORS.cream, 700),
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          textWrap: "balance",
        }}
      >
        {t("mobile.wrapped.card.playedAcross", { count: figures.games })}
      </div>
      {showChange && (
        <RecapChange
          percent={figures.changePercent}
          size={24}
          style={{ ...at(64, 1200), width: "fit-content" }}
        />
      )}

      {tiles.map(({ key, label, value }, index) => (
        <GlassCard
          key={key}
          x={60 + (index % 2) * (GLASS_WIDTH + 24)}
          y={1290 + Math.floor(index / 2) * (GLASS_HEIGHT + 24)}
          label={label}
          value={value}
          accent={accent}
        />
      ))}

      <div
        className={"truncate"}
        style={{
          ...at(60, 1836, 960),
          ...monoStyle(24, RECAP_COLORS.dim),
        }}
      >
        {username
          ? `${t("mobile.wrapped.card.madeOn")} · @${username}`
          : t("mobile.wrapped.card.madeOn")}
      </div>
    </div>
  );
}
