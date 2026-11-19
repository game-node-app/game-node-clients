import { CardSection, GameRow } from "@/components/general/card";
import { useTranslation } from "@repo/locales";
import {
  GameRating,
  ItemLikesButton,
  ProfileReviewListItemProps,
  TextLink,
  useProfileReviewGame,
} from "@repo/ui";
import { StatisticsSourceRequestDto } from "@repo/wrapper/server";

/** Plain-text excerpt of the review HTML, so the list doesn't mount a TipTap editor per item. */
function getReviewExcerpt(html: string | null | undefined): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(
    html.replace(/<\/(p|div|li|h[1-6])>/gi, " "),
    "text/html",
  );
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Own/other user's review in the reviews list: game row, short excerpt, "View more" and likes. */
const MobileProfileReviewListItem = ({
  review,
}: ProfileReviewListItemProps) => {
  const { t } = useTranslation();
  const gameQuery = useProfileReviewGame(review);
  const excerpt = getReviewExcerpt(review.content);
  const reviewHref = `/game/${review.gameId}?tab=reviews&reviewId=${review.id}`;

  return (
    <CardSection className="px-0">
      <GameRow
        game={gameQuery.data ?? review.game}
        title={gameQuery.data?.name ?? review.game?.name}
        meta={<GameRating value={review.rating} size="xs" />}
        href={reviewHref}
      />
      <div className="flex flex-col gap-2 px-3 pb-3">
        <p className="m-0 line-clamp-3 text-sm leading-5 text-neutral-300 [overflow-wrap:anywhere]">
          {excerpt || t("review.messages.noContent")}
        </p>
        <div className="flex items-center justify-between">
          <TextLink href={reviewHref} className="text-sm text-dimmed-1">
            {t("actions.viewMore")}
          </TextLink>
          <ItemLikesButton
            sourceId={review.id}
            sourceType={StatisticsSourceRequestDto.sourceType.REVIEW}
          />
        </div>
      </div>
    </CardSection>
  );
};

export { MobileProfileReviewListItem, getReviewExcerpt };
