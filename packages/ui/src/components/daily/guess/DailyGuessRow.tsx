import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { DailyGuessFeedbackDto } from "@repo/wrapper/server";
import { DAILY_RESULT_STYLES } from "#@/components/daily/util/dailyModes";

interface Props {
  feedback: DailyGuessFeedbackDto;
}

const DailyGuessRow = ({ feedback }: Props) => {
  const { t } = useTranslation();
  const common = [
    [t("daily.guess.commonGenres"), feedback.commonGenres],
    [t("daily.guess.commonPlatforms"), feedback.commonPlatforms],
  ] as const;

  return (
    <Paper withBorder p={"sm"} className={"w-full"}>
      <Stack className={"gap-1"}>
        <Group className={"justify-between flex-nowrap"}>
          <Text fw={600}>{feedback.name ?? t("daily.results.skipped")}</Text>
          <Badge
            variant={"light"}
            color={DAILY_RESULT_STYLES[feedback.result].color}
          >
            {t(`daily.results.${feedback.result}`)}
          </Badge>
        </Group>
        {common.map(
          ([label, values]) =>
            values.length > 0 && (
              <Text key={label} size={"sm"} c={"dimmed"}>
                {`${label}: ${values.join(", ")}`}
              </Text>
            ),
        )}
      </Stack>
    </Paper>
  );
};

export { DailyGuessRow };
