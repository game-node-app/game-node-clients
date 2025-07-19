import React, { useEffect, useMemo, useState } from "react";
import {
  CenteredErrorMessage,
  CenteredLoading,
  DetailsBox,
  useGameAchievementsV2,
  useGamesResource,
  useOnMobile,
} from "#@/components";
import { useJournalPlaylog } from "#@/components/journal/hooks/useJournalPlaylog.ts";
import { JournalPlaylogTimeline } from "#@/components/journal/playlog/JournalPlaylogTimeline.tsx";
import { SegmentedControl } from "@mantine/core";

interface Props {
  userId: string;
  gameId: number;
  withTitle?: boolean;
}

const JournalPlaylogView = ({ userId, gameId, withTitle = true }: Props) => {
  const onMobile = useOnMobile();
  const playlogQuery = useJournalPlaylog(userId, gameId);
  const platformsQuery = useGamesResource("platforms");
  const [selectedPlatformId, setSelectedPlatformid] = useState<
    number | undefined
  >(undefined);

  const availablePlatforms = useMemo(() => {
    const platformIds =
      playlogQuery.data?.flatMap((logGroup) => logGroup.platformIds) ?? [];

    return (
      platformsQuery.data?.filter((platform) =>
        platformIds.includes(platform.id),
      ) ?? []
    );
  }, [platformsQuery.data, playlogQuery.data]);

  const isEmpty = playlogQuery.isSuccess && playlogQuery.data.length === 0;

  useEffect(() => {
    if (availablePlatforms.length > 0) {
      setSelectedPlatformid(availablePlatforms[0].id);
    }
  }, [availablePlatforms]);

  return (
    <DetailsBox
      title={withTitle ? "Playlog" : ""}
      withBorder
      withPadding
      rightSide={
        <SegmentedControl
          value={`${selectedPlatformId}`}
          onChange={(value) => {
            setSelectedPlatformid(parseInt(value));
          }}
          fullWidth={onMobile}
          data={
            availablePlatforms.map((platform) => ({
              value: `${platform.id}`,
              label: platform.abbreviation,
            })) ?? []
          }
        />
      }
    >
      {isEmpty && <CenteredErrorMessage message={"Not enough data to show."} />}
      {playlogQuery.isLoading && <CenteredLoading />}
      {playlogQuery.data != undefined && selectedPlatformId != undefined && (
        <JournalPlaylogTimeline
          targetPlatformId={selectedPlatformId}
          itens={playlogQuery.data}
        />
      )}
    </DetailsBox>
  );
};

export { JournalPlaylogView };
