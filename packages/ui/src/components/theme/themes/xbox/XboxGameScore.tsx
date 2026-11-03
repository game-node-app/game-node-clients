import { Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconStarFilled } from "@tabler/icons-react";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { GameRating } from "#@/components/general/input/GameRating";
import { useReviewsScore } from "#@/components/review/hooks/useReviewsScore";

const STARS = ["1", "2", "3", "4", "5"] as const;

interface Props {
  gameId: number;
}

/**
 * Xbox fact sheet rating: the median next to its stars, then a column per star (growing bottom-up) with its share of reviews.
 */
const XboxGameScore = ({ gameId }: Props) => {
  const { t } = useTranslation();
  const score = useReviewsScore(gameId);
  const distribution = score.data?.distribution;
  const total = distribution?.total ?? 0;
  const topCount = Math.max(0, ...STARS.map((star) => distribution?.[star] ?? 0));

  return (
    <DetailsBox withDimmedTitle title={t("game.labels.userRating")}>
      {score.isLoading ? (
        <Skeleton className={"h-24"} />
      ) : (
        <div className={"gn-score"}>
          <div className={"gn-score-summary"}>
            <Text className={"gn-score-median"} c={total > 0 ? undefined : "dimmed"}>
              {total > 0 ? score.data!.median.toFixed(1) : "–"}
            </Text>
            <div>
              <GameRating value={score.data?.median ?? 0} size={"sm"} />
              <Text fz={"xs"} c={"dimmed"}>
                {t("game.labels.reviewsCount", { count: total })}
              </Text>
            </div>
          </div>
          <ul className={"gn-score-bars"} data-empty={total === 0 || undefined}>
            {STARS.map((star) => {
              const count = distribution?.[star] ?? 0;
              // no reviews yet: the chart still shows, with empty columns
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const isTop = total > 0 && count === topCount;
              return (
                <li
                  key={star}
                  className={"gn-score-bar"}
                  data-top={isTop || undefined}
                  title={t("game.labels.reviewsCount", { count })}
                  aria-label={`${star}★: ${percentage}% (${t("game.labels.reviewsCount", { count })})`}
                >
                  <span className={"gn-score-bar-value"} aria-hidden>
                    {total > 0 ? `${percentage}%` : "–"}
                  </span>
                  <span className={"gn-score-bar-track"} aria-hidden>
                    <span style={{ height: `${percentage}%` }} />
                  </span>
                  <span className={"gn-score-bar-label"} aria-hidden>
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
