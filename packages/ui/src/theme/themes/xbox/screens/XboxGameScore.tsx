import { Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconStarFilled } from "@tabler/icons-react";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { GameRating } from "#@/components/general/input/GameRating";
import { useReviewsScore } from "#@/components/review/hooks/useReviewsScore";
import classes from "./XboxGameScore.module.css";

const STARS = ["1", "2", "3", "4", "5"] as const;

interface Props {
  gameId: number;
}

/**
 * Xbox fact-sheet rating: the median beside its stars, then a column per star
 * (growing bottom-up) with its share of reviews. Tokens only; the bars are a
 * visual companion to the median and are hidden from assistive technology.
 */
const XboxGameScore = ({ gameId }: Props) => {
  const { t } = useTranslation();
  const score = useReviewsScore(gameId);
  const distribution = score.data?.distribution;
  const total = distribution?.total ?? 0;
  const topCount = Math.max(
    0,
    ...STARS.map((star) => distribution?.[star] ?? 0),
  );

  return (
    <DetailsBox
      withDimmedTitle
      title={t("game.labels.userRating")}
      stackProps={{ className: classes.box }}
    >
      {score.isLoading ? (
        <Skeleton className={classes.skeleton} />
      ) : (
        <div className={classes.score} data-xbox-game-score>
          <div className={classes.summary}>
            <Text
              className={classes.median}
              c={total > 0 ? undefined : "dimmed"}
            >
              {total > 0 ? score.data!.median.toFixed(1) : "–"}
            </Text>
            <div className={classes.summaryText}>
              <GameRating value={score.data?.median ?? 0} size={"sm"} />
              {total === 0 && (
                <Text fz={"xs"} c={"dimmed"}>
                  {t("game.messages.notEnoughReviews")}
                </Text>
              )}
            </div>
          </div>

          <ul
            className={classes.bars}
            data-empty={total === 0 || undefined}
            aria-hidden
          >
            {STARS.map((star) => {
              const count = distribution?.[star] ?? 0;
              // no reviews yet: the chart still shows, with empty columns
              const percentage =
                total > 0 ? Math.round((count / total) * 100) : 0;
              const isTop = total > 0 && count === topCount;
              return (
                <li
                  key={star}
                  className={classes.bar}
                  data-top={isTop || undefined}
                >
                  <span className={classes.barValue}>
                    {total > 0 ? `${percentage}%` : "–"}
                  </span>
                  <span className={classes.barTrack}>
                    <span
                      className={classes.barFill}
                      style={{ height: `${percentage}%` }}
                    />
                  </span>
                  <span className={classes.barLabel}>
                    {star}
                    <IconStarFilled size={10} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </DetailsBox>
  );
};

export { XboxGameScore };
