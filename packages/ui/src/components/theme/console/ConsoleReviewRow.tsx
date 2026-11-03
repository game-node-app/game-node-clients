import { Skeleton, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { EditorContent, useEditor } from "@tiptap/react";
import { Link } from "#@/util";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { GameRating } from "#@/components/general/input/GameRating";
import { useGame } from "#@/components/game/hooks/useGame";
import { DEFAULT_REVIEW_EDITOR_EXTENSIONS } from "#@/components/game/info/review/editor/GameInfoReviewEditor";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { useReview } from "#@/components/review/hooks/useReview";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useTrendingReviews } from "#@/components/statistics/hooks/useTrendingReviews";
import { CONSOLE_GAME_RELATIONS } from "./ConsoleGameRow";
import { getGameScreenshotUrl } from "./gameArt";
import { handleConsoleRowKeyDown } from "./consoleRowNavigation";

const ConsoleReviewCard = ({ reviewId }: { reviewId: string }) => {
  const reviewQuery = useReview(reviewId);
  const review = reviewQuery.data;
  const gameQuery = useGame(review?.gameId, {
    relations: CONSOLE_GAME_RELATIONS,
  });
  const game = gameQuery.data;
  const profileQuery = useUserProfile(review?.profileUserId);

  const editor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      editable: false,
      content: review?.content,
      immediatelyRender: false,
    },
    [review?.content],
  );

  if (reviewQuery.isLoading || gameQuery.isLoading) {
    return <Skeleton className={"gn-review-card"} />;
  }
  if (review == undefined || game == undefined) return null;

  // 1280x720: stays sharp on 2x screens at the card's width
  const shot = getGameScreenshotUrl(game, ImageSize.SCREENSHOT_HUGE);

  return (
    <Link
      href={`/game/${game.id}`}
      data-console-tile
      className={"gn-shortcut gn-review-card"}
    >
      {shot && (
        <img
          className={"gn-review-card-shot"}
          src={shot}
          alt={""}
          loading={"lazy"}
        />
      )}
      <span className={"gn-review-card-head"}>
        {/* not UserAvatarGroup: it is a profile link, and links can't nest inside the card */}
        <UserAvatar userId={review.profileUserId} size={32} />
        <span className={"gn-review-card-author"}>
          {profileQuery.data?.username}
        </span>
        <GameRating value={review.rating} size={"sm"} />
      </span>
      <span className={"gn-review-card-body"}>
        <span className={"gn-review-card-game"}>{game.name}</span>
        {editor && !editor.isEmpty && (
          <EditorContent className={"gn-review-card-text"} editor={editor} />
        )}
      </span>
    </Link>
  );
};

/** Trending reviews as console cards: a screenshot of the game, author and stars on top, the game and review over a bottom scrim. */
const ConsoleReviewRow = () => {
  const { t } = useTranslation();
  const trendingReviews = useTrendingReviews({
    period: StatisticsRankingsRequestDto.period.MONTH,
    offset: 0,
    limit: 10,
  });
  const reviewIds = trendingReviews.data?.items
    .map((item) => item.sourceId)
    .filter((id): id is string => typeof id === "string");

  if (trendingReviews.isError || reviewIds?.length === 0) return null;

  return (
    <Stack className={"gap-xs w-full"}>
      <Text className={"gn-console-row-title"}>
        {t("home.trendingReviews")}
      </Text>
      <div
        data-console-row
        className={"gn-console-row gn-review-row"}
        onKeyDown={handleConsoleRowKeyDown}
      >
        {reviewIds == undefined
          ? Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className={"gn-review-card"} />
            ))
          : reviewIds.map((id) => <ConsoleReviewCard key={id} reviewId={id} />)}
      </div>
    </Stack>
  );
};

export { ConsoleReviewRow };
