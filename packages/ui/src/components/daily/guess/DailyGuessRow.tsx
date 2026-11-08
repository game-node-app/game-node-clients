import { Group, Image, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconPlayerSkipForward } from "@tabler/icons-react";
import { DailyGuessFeedbackDto, Game } from "@repo/wrapper/server";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { DAILY_RESULT_STYLES } from "#@/components/daily/util/dailyModes";

interface Props {
  feedback: DailyGuessFeedbackDto;
  /** The guessed game, for its cover and year. */
  game?: Game;
}

const DailyGuessRow = ({ feedback, game }: Props) => {
  const { t } = useTranslation();
  const correct = feedback.result === "correct";
  const year = game?.firstReleaseDate
    ? new Date(game.firstReleaseDate).getFullYear()
    : undefined;
  const { color, labelKey } = DAILY_RESULT_STYLES[feedback.result];

  return (
    <Paper
      withBorder
      radius={10}
      px={12}
      py={10}
      className={"flex flex-wrap items-center gap-3 !bg-paper-8"}
      style={
        correct
          ? { borderColor: "var(--mantine-color-teal-filled)" }
          : undefined
      }
    >
      <Group className={"flex-1 min-w-[160px] flex-nowrap gap-3"}>
        {feedback.gameId == null ? (
          <ThemeIcon
            variant={"light"}
            color={"gray"}
            w={32}
            h={42}
            radius={4}
            aria-hidden
          >
            <IconPlayerSkipForward size={16} />
          </ThemeIcon>
        ) : (
          <Image
            src={
              getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_SMALL) ??
              "/img/game_placeholder.jpeg"
            }
            alt={""}
            w={32}
            h={42}
            radius={4}
            className={"shrink-0"}
          />
        )}
        <Stack className={"gap-0 min-w-0"}>
          <Text fz={15} fw={600} className={"truncate"}>
            {feedback.name ?? t("daily.results.skipped")}
          </Text>
          {year && (
            <Text fz={12} c={"dimmed"}>
              {year}
            </Text>
          )}
        </Stack>
      </Group>
      {feedback.gameId == null ? null : (
        // The server sends the result and the values in common; detailed traits
        // were removed from the contract in the same server release as billing.
        <Stack className={"gap-0.5 items-end"}>
          <Text fz={12} fw={600} c={color}>
            {t(labelKey)}
          </Text>
          {[...feedback.commonGenres, ...feedback.commonPlatforms].length >
            0 && (
            <Text fz={12} c={"dimmed"}>
              {[...feedback.commonGenres, ...feedback.commonPlatforms].join(
                ", ",
              )}
            </Text>
          )}
        </Stack>
      )}
    </Paper>
  );
};

export { DailyGuessRow };
