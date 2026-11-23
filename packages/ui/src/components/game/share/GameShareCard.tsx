import {
  GAME_SHARE_FONT_FAMILY,
  GameShareFonts,
} from "#@/components/game/share/GameShareFonts";
import {
  type GameShareBackground,
  type GameShareBlocks,
  type GameShareData,
  formatShareRating,
  getRatingStars,
  getTitleScale,
  getVisibleBlocks,
} from "#@/components/game/share/gameShareModel";
import {
  RecapBackdrop,
  RecapCover,
  getRecapBackdropUrl,
} from "#@/components/wrapped/card/RecapCover";
import { type RecapCardFormat } from "#@/components/wrapped/card/recapCardFormats";
import { ThemeScope } from "#@/theme/ThemeScope";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { useTranslation } from "@repo/locales";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";

/*
 * Native-size game share card ("Compartilhar jogo", Figma node 5702:21082).
 * It is laid out in the pixels it is exported at (see `RecapCardPreview`), and
 * it is dark artwork by design: it lives inside `ThemeScope`, so every color
 * below resolves from the GameNode theme whatever theme the app is using.
 */

// Surface and text come from the media pair; hairlines and the accent from the theme.
const CANVAS = "var(--gn-media-fade)";
const INK = "var(--gn-media-text)";
const INK_DIM = "var(--gn-media-text-dim)";
const RULE = "var(--gn-line-strong)";
const BRAND = "var(--gn-brand)";

/** `color` over transparency, so shadows and fades follow the media surface. */
function veil(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

interface CardMetrics {
  wordmarkWidth: number;
  wordmarkHeight: number;
  handleSize: number;
  coverWidth: number;
  coverHeight: number;
  coverRadius: number;
  titleSize: number;
  titleGap: number;
  creditSize: number;
  ratingSize: number;
  ratingGap: number;
  starSize: number;
  starGap: number;
  ruleHeight: number;
  statValueSize: number;
  statLabelSize: number;
  statGap: number;
  platformSlot: number;
  platformGap: number;
  platformRowHeight: number;
  platformLabelGap: number;
  platformLabelSize: number;
  dotSize: number;
  dotGap: number;
  statusSize: number;
  statusPadBottom: number;
  blockGap: number;
}

const STORY_METRICS: CardMetrics = {
  wordmarkWidth: 280,
  wordmarkHeight: 27.646,
  handleSize: 30,
  coverWidth: 300,
  coverHeight: 400,
  coverRadius: 20,
  titleSize: 132,
  titleGap: 14,
  creditSize: 34,
  ratingSize: 140,
  ratingGap: 34,
  starSize: 60,
  starGap: 7,
  ruleHeight: 2,
  statValueSize: 76,
  statLabelSize: 28,
  statGap: 6,
  platformSlot: 56,
  platformGap: 20,
  platformRowHeight: 89,
  platformLabelGap: 6,
  platformLabelSize: 28,
  dotSize: 14,
  dotGap: 12,
  statusSize: 28,
  statusPadBottom: 4,
  blockGap: 48,
};

/** The transparent Story keeps its content in a rounded panel and a smaller title. */
const STORY_PANEL_METRICS: CardMetrics = {
  ...STORY_METRICS,
  titleSize: 120,
  blockGap: 44,
};

const FEED_METRICS: CardMetrics = {
  wordmarkWidth: 220,
  wordmarkHeight: 21.722,
  handleSize: 24,
  coverWidth: 420,
  coverHeight: 560,
  coverRadius: 24,
  titleSize: 104,
  titleGap: 10,
  creditSize: 28,
  ratingSize: 104,
  ratingGap: 25,
  starSize: 44,
  starGap: 5,
  ruleHeight: 2,
  statValueSize: 60.8,
  statLabelSize: 22.4,
  statGap: 4.8,
  platformSlot: 45,
  platformGap: 16,
  platformRowHeight: 71,
  platformLabelGap: 5,
  platformLabelSize: 22,
  dotSize: 11,
  dotGap: 10,
  statusSize: 22,
  statusPadBottom: 3,
  blockGap: 28,
};

/** Tabler star icons: filled, outlined, or half filled over its outline. */
function Star({
  size,
  kind,
}: {
  size: number;
  kind: "full" | "half" | "empty";
}) {
  const outline = (
    <IconStar
      size={size}
      stroke={1}
      color={BRAND}
      style={{ display: "block" }}
    />
  );

  if (kind === "empty") return outline;
  if (kind === "full") {
    return (
      <IconStarFilled size={size} color={BRAND} style={{ display: "block" }} />
    );
  }

  return (
    <span
      style={{
        position: "relative",
        display: "block",
        width: size,
        height: size,
      }}
    >
      {outline}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size / 2,
          height: size,
          overflow: "hidden",
        }}
      >
        <IconStarFilled
          size={size}
          color={BRAND}
          style={{ display: "block" }}
        />
      </span>
    </span>
  );
}

function Header({ m, handle }: { m: CardMetrics; handle: string | null }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        flexShrink: 0,
      }}
    >
      <img
        src={"/img/awards/ballot-wordmark.svg"}
        alt={"GameNode"}
        style={{
          width: m.wordmarkWidth,
          height: m.wordmarkHeight,
          display: "block",
          flexShrink: 0,
        }}
      />
      {handle && (
        <span
          style={{
            fontSize: m.handleSize,
            fontWeight: 600,
            lineHeight: "normal",
            color: INK,
            whiteSpace: "nowrap",
          }}
        >
          {handle}
        </span>
      )}
    </div>
  );
}

function TitleBlock({
  m,
  name,
  credit,
  sizeScale = 1,
}: {
  m: CardMetrics;
  name: string;
  credit: string | null;
  sizeScale?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: m.titleGap,
        width: "100%",
        flexShrink: 0,
        overflow: "hidden",
        wordBreak: "break-word",
      }}
    >
      <span
        style={{
          fontSize: m.titleSize * sizeScale,
          fontWeight: 700,
          lineHeight: 0.96,
          letterSpacing: "-0.03em",
          color: INK,
        }}
      >
        {name}
      </span>
      {credit && (
        <span
          style={{
            fontSize: m.creditSize,
            fontWeight: 400,
            lineHeight: "normal",
            color: INK_DIM,
            whiteSpace: "nowrap",
          }}
        >
          {credit}
        </span>
      )}
    </div>
  );
}

function RatingRow({ m, rating }: { m: CardMetrics; rating: number }) {
  const { i18n } = useTranslation();
  const stars = getRatingStars(rating);
  const kinds: ("full" | "half" | "empty")[] = [
    ...Array<"full">(stars.full).fill("full"),
    ...(stars.half ? (["half"] as const) : []),
    ...Array<"empty">(stars.empty).fill("empty"),
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: m.ratingGap,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: m.ratingSize,
          fontWeight: 700,
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
          color: INK,
          whiteSpace: "nowrap",
        }}
      >
        {formatShareRating(rating, i18n?.language ?? "en")}
      </span>
      <div style={{ display: "flex", gap: m.starGap }}>
        {kinds.map((kind, index) => (
          <Star key={index} size={m.starSize} kind={kind} />
        ))}
      </div>
    </div>
  );
}

function Rule({ m }: { m: CardMetrics }) {
  return (
    <div
      style={{
        width: "100%",
        height: m.ruleHeight,
        backgroundColor: RULE,
        flexShrink: 0,
      }}
    />
  );
}

function Stat({
  m,
  value,
  label,
}: {
  m: CardMetrics;
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        flex: "1 0 0",
        minWidth: 1,
        display: "flex",
        flexDirection: "column",
        gap: m.statGap,
        lineHeight: "normal",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: m.statValueSize,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: INK,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: m.statLabelSize, color: INK_DIM }}>{label}</span>
    </div>
  );
}

function PlatformsStat({
  m,
  icons,
  label,
}: {
  m: CardMetrics;
  icons: string[];
  label: string;
}) {
  return (
    <div
      style={{
        flex: "1 0 0",
        minWidth: 1,
        display: "flex",
        flexDirection: "column",
        gap: m.platformLabelGap,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: m.platformGap,
          height: m.platformRowHeight,
          overflow: "hidden",
        }}
      >
        {icons.map((icon) => (
          <img
            key={icon}
            src={getServerStoredIcon(icon)}
            alt={""}
            style={{
              width: m.platformSlot,
              height: m.platformSlot,
              objectFit: "contain",
              flexShrink: 0,
              display: "block",
              // The icons are white rasters made for dark surfaces. Light themes
              // ink every `/public/icons/` image globally, but this card is
              // always dark, so keep them as served.
              filter: "none",
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: m.platformLabelSize,
          lineHeight: "normal",
          color: INK_DIM,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StatusRow({ m, label }: { m: CardMetrics; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: m.dotGap,
        paddingBottom: m.statusPadBottom,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: m.dotSize,
          height: m.dotSize,
          borderRadius: "50%",
          backgroundColor: BRAND,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: m.statusSize,
          fontWeight: 600,
          lineHeight: "normal",
          color: INK,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface InfoProps {
  m: CardMetrics;
  data: GameShareData;
  visible: GameShareBlocks;
}

/**
 * Title, rating, the stats row and the library status. A block without data (or
 * switched off) is not drawn, and the rules only appear between blocks that are.
 */
function CardInfo({ m, data, visible }: InfoProps) {
  const { t } = useTranslation();
  const hasStats =
    visible.playtime || visible.achievements || visible.platforms;
  const hasStatus = !!data.statusLabel;

  return (
    <>
      <TitleBlock
        m={m}
        name={data.name}
        credit={data.credit}
        sizeScale={getTitleScale(data.name)}
      />
      {visible.rating && data.rating != null && (
        <RatingRow m={m} rating={data.rating} />
      )}
      {hasStats && (
        <>
          <Rule m={m} />
          <div style={{ display: "flex", width: "100%", flexShrink: 0 }}>
            {visible.playtime && data.playtimeHours != null && (
              <Stat
                m={m}
                value={`${data.playtimeHours} h`}
                label={t("game.share.card.playtime")}
              />
            )}
            {visible.achievements && data.achievements && (
              <Stat
                m={m}
                value={`${data.achievements.obtained}/${data.achievements.total}`}
                label={t("game.share.card.achievements")}
              />
            )}
            {visible.platforms && (
              <PlatformsStat
                m={m}
                icons={data.platformIcons}
                label={t("game.share.card.platforms")}
              />
            )}
          </div>
        </>
      )}
      {hasStatus && (
        <>
          <Rule m={m} />
          <StatusRow m={m} label={data.statusLabel!} />
        </>
      )}
    </>
  );
}

function Cover({ m, data }: { m: CardMetrics; data: GameShareData }) {
  return (
    <RecapCover
      game={data.game}
      width={m.coverWidth}
      height={m.coverHeight}
      radius={m.coverRadius}
      style={{ boxShadow: `0 16px 48px ${veil("var(--gn-media-scrim)", 45)}` }}
    />
  );
}

function StoryCard({
  data,
  visible,
  background,
}: Props & { visible: GameShareBlocks }) {
  const panel = background === "transparent";
  const m = panel ? STORY_PANEL_METRICS : STORY_METRICS;

  const content = (
    <>
      <Header m={m} handle={data.handle} />
      {!panel && <div style={{ flex: "1 0 0", minHeight: 1 }} />}
      <Cover m={m} data={data} />
      <CardInfo m={m} data={data} visible={visible} />
    </>
  );

  if (panel) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: m.blockGap,
            padding: 64,
            borderRadius: 48,
            backgroundColor: CANVAS,
            overflow: "hidden",
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap: m.blockGap,
        padding: "80px 72px 72px",
        overflow: "hidden",
      }}
    >
      {content}
    </div>
  );
}

function FeedCard({
  data,
  visible,
  background,
}: Props & { visible: GameShareBlocks }) {
  const panel = background === "transparent";
  const m = FEED_METRICS;

  const row = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 72,
        width: "100%",
        height: "100%",
        padding: panel ? 56 : 72,
        overflow: "hidden",
      }}
    >
      <Cover m={m} data={data} />
      <div
        style={{
          flex: "1 0 0",
          minWidth: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: m.blockGap,
          overflow: "hidden",
        }}
      >
        <Header m={m} handle={data.handle} />
        <div style={{ flex: "1 0 0", minHeight: 1 }} />
        <CardInfo m={m} data={data} visible={visible} />
      </div>
    </div>
  );

  if (panel) {
    return (
      <div style={{ position: "absolute", inset: 40 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 48,
            backgroundColor: CANVAS,
            overflow: "hidden",
          }}
        >
          {row}
        </div>
      </div>
    );
  }

  return <div style={{ position: "absolute", inset: 0 }}>{row}</div>;
}

/**
 * With no wide art the cover is all there is. Drawn sharp and enlarged it repeats
 * the cover (and its lettering) right behind the real one, so it is blurred into
 * an ambient wash of the cover's colors instead. The scale hides the soft edges
 * a blur leaves.
 */
const COVER_WASH: CSSProperties = {
  filter: "blur(36px) saturate(1.6) brightness(1.15)",
  transform: "scale(1.3)",
};

/** Backdrop art (cover as the last fallback) plus the fade that keeps text legible. */
function Backdrop({
  data,
  format,
}: {
  data: GameShareData;
  format: RecapCardFormat;
}) {
  const story = format === "story";

  const area: CSSProperties = story
    ? { left: 0, top: 0, width: 1080, height: 1260 }
    : { left: 0, top: 0, width: 1000, height: 900 };
  const fade = story
    ? `linear-gradient(180deg, ${veil(CANVAS, 55)} 0%, ${veil(CANVAS, 10)} 18%, ${veil(CANVAS, 35)} 50%, ${CANVAS} 100%)`
    : `linear-gradient(90deg, ${veil(CANVAS, 25)} 0%, ${veil(CANVAS, 60)} 55%, ${CANVAS} 100%)`;

  return (
    <>
      <div style={{ position: "absolute", overflow: "hidden", ...area }}>
        <RecapBackdrop
          game={data.game}
          style={getRecapBackdropUrl(data.game) ? undefined : COVER_WASH}
        />
      </div>
      <div
        style={{
          position: "absolute",
          ...area,
          width: story ? 1080 : 1002,
          height: story ? 1262 : 900,
          backgroundImage: fade,
        }}
      />
    </>
  );
}

export interface GameShareCardProps {
  data: GameShareData;
  /** Which optional blocks the person switched on. */
  blocks: GameShareBlocks;
  format: RecapCardFormat;
  background: GameShareBackground;
}

type Props = GameShareCardProps;

/**
 * The shareable card at its native size. Render it inside `RecapCardPreview`
 * and export that node with `exportCardImage`.
 */
export function GameShareCard(props: Props): ReactNode {
  const { data, blocks, format, background } = props;
  const visible = getVisibleBlocks(data, blocks);
  const transparent = background === "transparent";

  return (
    <ThemeScope
      data-testid={"game-share-card-scope"}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        fontFamily: GAME_SHARE_FONT_FAMILY,
        color: INK,
        backgroundColor: transparent ? undefined : CANVAS,
      }}
    >
      <GameShareFonts />
      {background === "art" && <Backdrop data={data} format={format} />}
      {format === "story" ? (
        <StoryCard {...props} visible={visible} />
      ) : (
        <FeedCard {...props} visible={visible} />
      )}
    </ThemeScope>
  );
}
