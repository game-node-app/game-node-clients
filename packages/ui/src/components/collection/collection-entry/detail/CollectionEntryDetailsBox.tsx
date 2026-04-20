import React, { useMemo } from "react";
import {
  DetailsBox,
  getLocalizedCollectionEntryStatusName,
  useCollectionEntry,
  usePlaytimeForGame,
} from "#@/components";
import { Badge, Group, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryDetailsBox = ({ collectionEntryId, userId }: Props) => {
  const { t } = useTranslation();
  const collectionEntryQuery = useCollectionEntry(collectionEntryId as string);
  const platforms = collectionEntryQuery.data?.ownedPlatforms;
  const playtimeQuery = usePlaytimeForGame(
    userId,
    collectionEntryQuery.data?.gameId,
  );

  const totalPlaytimeSeconds = useMemo(() => {
    return (
      playtimeQuery.data?.reduce((acc, playtime) => {
        return acc + playtime.totalPlaytimeSeconds;
      }, 0) ?? 0
    );
  }, [playtimeQuery.data]);

  return (
    <DetailsBox
      withPadding
      withBorder
      title={t("collectionEntry.tabs.details")}
    >
      {collectionEntryQuery.isLoading ? (
        <>
          {new Array(3).fill(0).map((_v, i) => (
            <Skeleton key={i} className={"w-48 h-12 mb-2"} />
          ))}
        </>
      ) : (
        <>
          <Text>
            <Text span className={"font-bold"}>
              {t("collectionEntry.labels.status")}:{" "}
            </Text>
            <Badge>
              {getLocalizedCollectionEntryStatusName(
                collectionEntryQuery.data!.status,
                t,
              )}
            </Badge>
          </Text>
          <Group className={"gap-1"}>
            <Text span className={"font-bold"}>
              {t("collectionEntry.labels.platforms")}:{" "}
            </Text>
            {platforms?.map((platform) => (
              <Badge key={platform.id} variant={"default"} className={"me-1"}>
                {platform.abbreviation}
              </Badge>
            ))}
          </Group>
          <Text>
            <Text span className={"font-bold"}>
              {t("profile.stats.playtime")}:{" "}
            </Text>
            <Text span>{Math.ceil(totalPlaytimeSeconds / 3600)} Hours</Text>
          </Text>
        </>
      )}
    </DetailsBox>
  );
};

export { CollectionEntryDetailsBox };
