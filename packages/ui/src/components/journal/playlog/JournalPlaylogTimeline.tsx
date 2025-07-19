import React, { useCallback, useMemo } from "react";
import {
  JournalPlaylogEntryDto,
  JournalPlaylogGroupDto,
} from "@repo/wrapper/server";
import {
  CenteredErrorMessage,
  DetailsBox,
  JournalPlaylogObtainedAchievements,
  useGameAchievementsV2,
} from "#@/components";
import { Group, Stack, Text, Timeline, Title } from "@mantine/core";
import { match } from "ts-pattern";
import dayjs from "dayjs";
import {
  IconMilitaryAward,
  IconProgress,
  IconProgressCheck,
} from "@tabler/icons-react";
import { JournalPlaylogCollectionStatus } from "#@/components/journal/playlog/JournalPlaylogCollectionStatus.tsx";

interface Props {
  targetPlatformId: number;
  itens: JournalPlaylogGroupDto[];
}

const JournalPlaylogTimeline = ({ itens, targetPlatformId }: Props) => {
  const renderedLogGroups = useMemo(() => {
    if (itens.length === 0) {
      return null;
    }

    return itens.filter((group) =>
      group.platformIds.includes(targetPlatformId),
    );
  }, [targetPlatformId, itens]);

  return (
    <Stack>
      {(renderedLogGroups == undefined || renderedLogGroups.length === 0) && (
        <CenteredErrorMessage message={"No log entries for this platform."} />
      )}
      <Timeline active={itens.length} bulletSize={28}>
        {renderedLogGroups?.map((log) => {
          if (
            log.type === JournalPlaylogGroupDto.type.COLLECTION_ENTRY_STATUS
          ) {
            return (
              <Timeline.Item
                key={`${log.date}-${log.type}`}
                title={dayjs(log.date).format("LL")}
                bullet={<IconProgressCheck />}
              >
                <JournalPlaylogCollectionStatus items={log.entries} />
              </Timeline.Item>
            );
          }

          return (
            <Timeline.Item
              key={`${log.date}-${log.type}`}
              title={dayjs(log.date).format("LL")}
              bullet={<IconMilitaryAward />}
            >
              <JournalPlaylogObtainedAchievements items={log.entries} />
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Stack>
  );
};

export { JournalPlaylogTimeline };
