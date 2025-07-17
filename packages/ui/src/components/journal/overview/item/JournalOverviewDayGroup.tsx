import React from "react";
import type {
  JournalEntryDetailsDto,
  JournalEntryDayGroupDto,
} from "@repo/wrapper/server";
import { Box, Center, Divider, Group, Stack, Text } from "@mantine/core";
import { JournalOverviewDayItem, useGame } from "#@/components";

interface Props {
  dayGroup: JournalEntryDayGroupDto;
}

const JournalOverviewDayGroup = ({ dayGroup }: Props) => {
  const targetDay = dayGroup.day;
  return (
    <Box className={"relative"}>
      <Group className={"w-full flex-nowrap items-start"}>
        <Center className={"w-8 h-20 flex "}>
          <Text className={"text-center text-lg text-brand-4"}>
            {targetDay}
          </Text>
        </Center>
        <Stack className={"grow"}>
          {dayGroup.entries.map((entry) => (
            <Stack
              key={`${entry.collectionEntryId}-${entry.status}`}
              className={"gap-1 "}
            >
              <JournalOverviewDayItem item={entry} />
              <Divider className="w-full" />
            </Stack>
          ))}
        </Stack>
      </Group>
    </Box>
  );
};

export { JournalOverviewDayGroup };
