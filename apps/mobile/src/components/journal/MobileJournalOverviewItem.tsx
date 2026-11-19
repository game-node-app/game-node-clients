import { CardSection, GameRow } from "@/components/general/card";
import { Badge, Skeleton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  GameRating,
  getLocalizedCollectionEntryStatusName,
  isNotFoundApiError,
  JournalOverviewItemProps,
  useJournalOverviewItem,
} from "@repo/ui";

/** Journal overview row: day, cover, title, rating, platform and status chips. */
const MobileJournalOverviewItem = ({
  userId,
  item,
  targetDay,
}: JournalOverviewItemProps) => {
  const { t } = useTranslation();
  const { collectionEntryQuery, gameQuery, reviewQuery, platformNames } =
    useJournalOverviewItem(userId, item);

  if (isNotFoundApiError(collectionEntryQuery.error)) {
    // The entry became hidden after the overview was cached.
    return null;
  }

  if (!collectionEntryQuery.data || !gameQuery.data) {
    return <Skeleton className="h-[84px] w-full rounded-2xl" />;
  }

  return (
    <CardSection className="px-0">
      <GameRow
        game={gameQuery.data}
        leading={targetDay}
        title={gameQuery.data.name}
        meta={
          reviewQuery.data ? (
            <GameRating value={reviewQuery.data.rating} size="xs" />
          ) : undefined
        }
        chips={
          <>
            {platformNames && (
              <Badge size="sm" variant="light" color="gray">
                {platformNames}
              </Badge>
            )}
            <Badge size="sm" variant="light">
              {getLocalizedCollectionEntryStatusName(item.status, t)}
            </Badge>
          </>
        }
        href={`/library/${userId}/collection/entry/${collectionEntryQuery.data.id}`}
      />
    </CardSection>
  );
};

export { MobileJournalOverviewItem };
