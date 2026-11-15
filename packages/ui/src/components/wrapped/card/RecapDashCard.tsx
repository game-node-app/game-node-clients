import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { RecapCover } from "#@/components/wrapped/card/RecapCover";
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

function StatBox({
  x,
  value,
  label,
}: {
  x: number;
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        ...at(x, 1610, 468, 160),
        borderRadius: 24,
        background: RECAP_COLORS.panel,
        padding: "26px 30px",
      }}
      className={"flex flex-col justify-between"}
    >
      <div className={"truncate"} style={displayStyle(58, RECAP_COLORS.cream)}>
        {value}
      </div>
      <div style={monoStyle(20)}>{label}</div>
    </div>
  );
}

/**
 * Dash (Story, 1080x1920), ported from Echo's "Frase": one sentence built
 * around the hours figure, the three most played games as tall cover tiles
 * and two stat boxes.
 */
export function RecapDashCard({
  period,
  periodText,
  summary,
  figures,
  games,
  custom,
}: RecapCardProps) {
  const { t } = useTranslation();
  const ranked = getRankedGames(summary, games).slice(0, 3);
  const accent = getRecapAccent(custom);
  const extra = getRecapExtraStat(summary, custom);
  const change = custom?.showComparison ? figures.changePercent : null;
  const tail = period ? t(`mobile.wrapped.card.tail.${period}`) : periodText;

  return (
    <div
      className={"relative w-full h-full overflow-hidden"}
      style={{
        background: `radial-gradient(1000px 900px at 50% 0%, ${accent}48, transparent), ${RECAP_COLORS.ground}`,
        color: RECAP_COLORS.cream,
      }}
    >
      <div style={at(60, 110)}>
        <GameNodeLogo style={{ width: 180 }} />
      </div>
      <div
        style={{ ...at(520, 128, 500), ...monoStyle(34), textAlign: "right" }}
      >
        {periodText}
      </div>

      <div
        style={{ ...at(60, 290), ...displayStyle(96, RECAP_COLORS.muted, 600) }}
      >
        {t("mobile.wrapped.card.youPlayed")}
      </div>
      <div
        style={{
          ...at(48, 390, 980),
          ...displayStyle(330, accent),
          letterSpacing: "-0.06em",
        }}
      >
        {formatHours(figures.hours)}
      </div>
      <div
        style={{ ...at(60, 690), ...displayStyle(96, RECAP_COLORS.cream, 700) }}
      >
        {t("mobile.wrapped.card.hoursUnit")}
      </div>
      <div
        style={{ ...at(60, 798), ...displayStyle(96, RECAP_COLORS.muted, 600) }}
      >
        {tail}
      </div>
      {change != null && (
        <div
          style={{
            ...at(60, 920),
            ...monoStyle(
              30,
              change >= 0 ? RECAP_COLORS.positive : RECAP_COLORS.negative,
            ),
          }}
        >
          {t("mobile.wrapped.card.vsPrevious", {
            percent: `${change > 0 ? "+" : ""}${change}`,
          })}
        </div>
      )}

      <div style={{ ...at(60, 1010), ...monoStyle(26) }}>
        {t("mobile.wrapped.card.topGames")}
      </div>
      {ranked.map(({ game, seconds }, index) => (
        <div
          key={game?.id ?? index}
          className={"overflow-hidden"}
          style={{
            ...at(60 + index * 328, 1060, 304, 470),
            borderRadius: 28,
            background: "#2A2622",
          }}
        >
          <RecapCover game={game} width={304} height={470} radius={0} />
          <div
            className={"absolute inset-0"}
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,10,9,0) 40%, rgba(11,10,9,0.94))",
            }}
          />
          <div
            style={{
              ...at(22, 0),
              top: undefined,
              bottom: 120,
              ...displayStyle(112, RECAP_COLORS.cream),
            }}
          >
            {index + 1}
          </div>
          <div
            className={"line-clamp-2"}
            style={{
              ...at(24, 0, 256),
              top: undefined,
              bottom: 62,
              ...displayStyle(30, RECAP_COLORS.cream, 700),
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {game?.name ?? "-"}
          </div>
          <div
            style={{
              ...at(24, 0),
              top: undefined,
              bottom: 26,
              ...monoStyle(20, RECAP_COLORS.muted, false),
            }}
          >
            {formatPlaytime(seconds)}
          </div>
        </div>
      ))}

      <StatBox
        x={60}
        value={`${figures.games}`}
        label={t("mobile.wrapped.card.gamesPlayed")}
      />
      <StatBox x={552} value={extra.value} label={t(extra.labelKey)} />

      <div style={{ ...at(60, 1824), ...monoStyle(26, "#6F665B") }}>
        {t("mobile.wrapped.card.madeOn")}
      </div>
    </div>
  );
}
