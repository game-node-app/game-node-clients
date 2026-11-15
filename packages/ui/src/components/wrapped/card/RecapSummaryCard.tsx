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
  getRecapAccent,
  getRecapExtraStat,
} from "#@/components/wrapped/card/recapCustomization";
import { useTranslation } from "@repo/locales";

function Stat({
  label,
  value,
  grow = 1,
  platform,
}: {
  label: string;
  value: string;
  grow?: number;
  platform?: boolean;
}) {
  return (
    <div
      className={"flex flex-col justify-between"}
      style={{
        flex: grow,
        minWidth: 0,
        height: 150,
        borderRadius: 24,
        background: RECAP_COLORS.panel,
        padding: "22px 26px",
      }}
    >
      {platform ? (
        <RecapPlatformMark name={value} size={30} />
      ) : (
        <div
          className={"line-clamp-2"}
          style={displayStyle(46, RECAP_COLORS.cream)}
        >
          {value}
        </div>
      )}
      <div style={monoStyle(18)}>{label}</div>
    </div>
  );
}

/**
 * Feed summary (1600x900): the hours figure on the left, the top game as a
 * large cover tile and the next four in a grid on the right. The Story
 * templates (Poster, Dash, Bento) have their own components.
 */
export function RecapSummaryCard({
  periodText,
  summary,
  figures,
  games,
  custom,
}: RecapCardProps) {
  const { t } = useTranslation();
  const ranked = getRankedGames(summary, games);
  const [top, ...others] = ranked;
  const accent = getRecapAccent(custom);
  const extra = getRecapExtraStat(summary, custom);
  const change = custom?.showComparison ? figures.changePercent : null;

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: `radial-gradient(900px 700px at 22% 8%, ${accent}40, transparent), ${RECAP_COLORS.ground}`,
        color: RECAP_COLORS.cream,
      }}
    >
      <div style={at(56, 52)}>
        <GameNodeLogo style={{ width: 170 }} />
      </div>
      <div
        style={{ ...at(300, 62, 380), ...monoStyle(26), textAlign: "right" }}
      >
        {periodText}
      </div>

      <div style={{ ...at(56, 168), ...monoStyle(26) }}>
        {t("mobile.wrapped.card.hoursPlayed")}
      </div>
      <div
        style={{
          ...at(48, 196, 640),
          ...displayStyle(330, accent),
          letterSpacing: "-0.06em",
        }}
      >
        {formatHours(figures.hours)}
        <span style={{ fontSize: 110 }}>h</span>
      </div>
      {change != null && (
        <div
          style={{
            ...at(56, 520),
            ...monoStyle(
              26,
              change >= 0 ? RECAP_COLORS.positive : RECAP_COLORS.negative,
            ),
          }}
        >
          {t("mobile.wrapped.card.vsPrevious", {
            percent: `${change > 0 ? "+" : ""}${change}`,
          })}
        </div>
      )}

      <div className={"flex"} style={{ ...at(56, 694, 624), gap: 16 }}>
        <Stat
          label={t("mobile.wrapped.card.gamesPlayed")}
          value={`${figures.games}`}
        />
        <Stat label={t(extra.labelKey)} value={extra.value} />
        <Stat
          label={t("mobile.wrapped.card.topPlatform")}
          value={summary.topPlatform?.name ?? "-"}
          grow={1.8}
          platform
        />
      </div>

      <div
        className={"overflow-hidden"}
        style={{ ...at(716, 52, 392, 796), borderRadius: 40 }}
      >
        <RecapBackdrop game={top?.game} />
        <RecapCover game={top?.game} width={392} height={796} radius={0} />
        <div
          className={"absolute inset-0"}
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,10,9,0) 45%, rgba(11,10,9,0.94))",
          }}
        />
        <div
          style={{
            ...at(30, 0),
            top: undefined,
            bottom: 128,
            ...displayStyle(130, RECAP_COLORS.cream),
          }}
        >
          1
        </div>
        <div
          className={"line-clamp-2"}
          style={{
            ...at(30, 0, 332),
            top: undefined,
            bottom: 72,
            ...displayStyle(48, RECAP_COLORS.cream, 700),
          }}
        >
          {top?.game?.name ?? "-"}
        </div>
        <div
          style={{
            ...at(30, 0),
            top: undefined,
            bottom: 30,
            ...monoStyle(22, RECAP_COLORS.muted, false),
          }}
        >
          {top ? formatPlaytime(top.seconds) : "-"}
        </div>
      </div>

      {others.slice(0, 4).map(({ game, seconds }, index) => (
        <div
          key={game?.id ?? index}
          className={"overflow-hidden"}
          style={{
            ...at(
              1124 + (index % 2) * 212,
              52 + Math.floor(index / 2) * 408,
              200,
              388,
            ),
            borderRadius: 28,
          }}
        >
          <RecapCover game={game} width={200} height={388} radius={0} />
          <div
            className={"absolute inset-0"}
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,10,9,0) 50%, rgba(11,10,9,0.92))",
            }}
          />
          <div
            style={{
              ...at(16, 0),
              top: undefined,
              bottom: 98,
              ...displayStyle(60, RECAP_COLORS.cream),
            }}
          >
            {index + 2}
          </div>
          <div
            className={"line-clamp-2"}
            style={{
              ...at(16, 0, 170),
              top: undefined,
              bottom: 44,
              ...displayStyle(24, RECAP_COLORS.cream, 700),
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {game?.name ?? "-"}
          </div>
          <div
            style={{
              ...at(16, 0),
              top: undefined,
              bottom: 16,
              ...monoStyle(16, RECAP_COLORS.muted, false),
            }}
          >
            {formatPlaytime(seconds)}
          </div>
        </div>
      ))}
    </div>
  );
}
