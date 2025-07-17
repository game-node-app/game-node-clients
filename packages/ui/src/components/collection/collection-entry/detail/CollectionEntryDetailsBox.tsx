import React, { useMemo } from "react";
import {
  DetailsBox,
  getCollectionEntryStatusName,
  useCollectionEntry,
  usePlaytimeForGame,
} from "#@/components";
import { Badge, Skeleton, Text } from "@mantine/core";

interface Props {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryDetailsBox = ({ collectionEntryId, userId }: Props) => {
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
    <DetailsBox withPadding withBorder title={`Details`}>
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
              Status:{" "}
            </Text>
            <Badge>
              {getCollectionEntryStatusName(collectionEntryQuery.data!.status)}
            </Badge>
          </Text>
          <Text>
            <Text span className={"font-bold"}>
              Platforms:{" "}
            </Text>
            {platforms?.map((platform) => (
              <Badge key={platform.id} variant={"default"}>
                {platform.name}
              </Badge>
            ))}
          </Text>
          <Text>
            <Text span className={"font-bold"}>
              Playtime:{" "}
            </Text>
            <Text span>{Math.ceil(totalPlaytimeSeconds / 3600)} Hours</Text>
          </Text>
        </>
      )}
    </DetailsBox>
  );
};

export { CollectionEntryDetailsBox };
