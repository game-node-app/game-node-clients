import { Text } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import classes from "./XboxProfileStats.module.css";

export interface XboxStatsTile {
  value: string;
  label: string;
}

export interface XboxStatsStripProps {
  tiles: XboxStatsTile[];
  /** 0-100, already rounded. */
  finishedShare: number;
  finishedCount: number;
  totalGames: number;
  /** Playtime disclaimer shown under the strip. */
  note?: string;
  testId?: string;
}

/**
 * One panel of headline numbers split by thin rules, ending with the backlog
 * completion meter. The Xbox profile summary and the stats page share it, so
 * both read the same numbers with the same finished share.
 */
const XboxStatsStrip = ({
  tiles,
  finishedShare,
  finishedCount,
  totalGames,
  note,
  testId = "xbox-profile-stats",
}: XboxStatsStripProps) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const format = new Intl.NumberFormat(language).format;

  return (
    <div className={classes.wrap} data-testid={testId}>
      <div className={classes.strip}>
        {tiles.map((tile) => (
          <div key={tile.label} className={classes.stat}>
            <Text className={classes.value}>{tile.value}</Text>
            <Text className={classes.label}>{tile.label}</Text>
          </div>
        ))}
        <div className={classes.stat}>
          <Text className={classes.value}>{finishedShare}%</Text>
          <Text className={classes.label}>
            {t("profile.stats.backlogTracking")}
          </Text>
          <div
            className={classes.meter}
            role={"progressbar"}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={finishedShare}
            aria-label={t("profile.stats.backlogTracking")}
          >
            <span
              className={classes.meterFill}
              style={{ width: `${finishedShare}%` }}
            />
          </div>
          <Text className={classes.note}>
            {format(finishedCount)} / {format(totalGames)}{" "}
            {t("profile.stats.finishedGames").toLowerCase()}
          </Text>
        </div>
      </div>
      {note && <Text className={classes.note}>* {note}</Text>}
    </div>
  );
};

export { XboxStatsStrip };
