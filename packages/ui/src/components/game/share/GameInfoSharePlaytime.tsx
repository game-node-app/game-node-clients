import { Group, Stack, Text } from "@mantine/core";
import { usePlaytimeForGame, useUserId } from "#@/components";
import { getServerStoredIcon } from "#@/util";
import { useMemo } from "react";
import { useTranslation } from "@repo/locales";

interface Props {
  gameId: number;
}

const GameInfoSharePlaytime = ({ gameId }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const { data: playtimeEntries } = usePlaytimeForGame(userId, gameId);

  const playtimeBySource = useMemo(() => {
    if (playtimeEntries == undefined) return [];

    const groupedBySource = playtimeEntries.reduce((acc, entry) => {
      const currentTotal = acc.get(entry.source) ?? 0;
      acc.set(entry.source, currentTotal + entry.totalPlaytimeSeconds);

      return acc;
    }, new Map<string, number>());

    return Array.from(groupedBySource.entries())
      .map(([source, totalPlaytimeSeconds]) => ({
        source,
        totalPlaytimeSeconds,
        playtimeInHours: Math.ceil(totalPlaytimeSeconds / 3600),
      }))
      .sort((a, b) => a.source.localeCompare(b.source));
  }, [playtimeEntries]);

  if (playtimeBySource.length === 0) {
    return null;
  }

  return (
    <Stack className={"gap-1 items-start"}>
      <Text>{t("profile.stats.playtime")}</Text>
      <Stack className={"gap-1 items-start"}>
        {playtimeBySource.map((sourcePlaytime) => (
          <Group
            key={`playtime-source-${sourcePlaytime.source}`}
            className={"w-full justify-start items-center gap-2"}
          >
            <img
              src={getServerStoredIcon(sourcePlaytime.source)}
              alt={`${sourcePlaytime.source} icon`}
              className={"w-5 h-5 object-contain"}
            />
            <Text size={"sm"}>{`${sourcePlaytime.playtimeInHours}h`}</Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
};

export { GameInfoSharePlaytime };
