import type { AwardsScoreboardPersonalGOTY } from "#@/components/awards/types";
import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import {
  formatNumber,
  useFormatLocale,
} from "#@/components/events/util/format";
import { cn } from "#@/util";
import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";

export interface AwardsResultsPersonalGOTYProps {
  personalGOTY: AwardsScoreboardPersonalGOTY;
  game?: Game | null;
  className?: string;
}

/**
 * Final card of the result list (frame `5410:1063`): the viewer's personal GOTY
 * and how many other people picked it. `otherUsersCount` excludes the viewer,
 * so the copy says "other people" (G16); a zero count omits the sentence.
 */
export function AwardsResultsPersonalGOTY({
  personalGOTY,
  game,
  className,
}: AwardsResultsPersonalGOTYProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const count = formatNumber(personalGOTY.otherUsersCount, locale);
  const name =
    game?.name ?? t("awards.results.gameFallback", { id: personalGOTY.gameId });

  return (
    <Paper
      data-awards-results-personal-goty
      data-game-id={personalGOTY.gameId}
      className={cn("border border-paper-4 bg-paper-2 p-3 md:p-4", className)}
    >
      <Group align={"flex-start"} wrap={"nowrap"} gap={"sm"}>
        <Box className={"w-16 shrink-0"}>
          <AwardsGameCover game={game} />
        </Box>
        <Stack gap={4} className={"min-w-0 flex-1"}>
          <Text size={"xs"} c={"dimmed"} className={"uppercase tracking-wide"}>
            {t("awards.results.personalGoty.title")}
          </Text>
          <Text fw={600} className={"truncate"}>
            {name}
          </Text>
          {personalGOTY.otherUsersCount > 0 && count && (
            <Text size={"sm"} c={"dimmed"}>
              {t("awards.results.personalGoty.others", { count })}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}
