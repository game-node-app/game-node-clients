import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { DailyGuessFeedbackDto } from "@repo/wrapper/server";
import { DAILY_RESULT_STYLES } from "#@/components/daily/util/dailyModes";

interface Props {
  feedback: DailyGuessFeedbackDto;
}

const DailyGuessRow = ({ feedback }: Props) => {
  const { t } = useTranslation();
  const {
    color,
    icon: ResultIcon,
    labelKey,
  } = DAILY_RESULT_STYLES[feedback.result];
  const common = [
    [t("daily.guess.commonGenres"), feedback.commonGenres],
    [t("daily.guess.commonPlatforms"), feedback.commonPlatforms],
  ] as const;

  return (
    <Group className={"flex-nowrap items-start gap-3 p-3"}>
      <ThemeIcon variant={"light"} color={color} radius={"xl"} aria-hidden>
        <ResultIcon size={16} />
      </ThemeIcon>
      <Stack className={"gap-0.5 min-w-0 min-h-7 justify-center"}>
        <Group className={"gap-2"}>
          {feedback.name && <Text fw={600}>{feedback.name}</Text>}
          <Text size={"xs"} fw={600} c={color}>
            {t(labelKey)}
          </Text>
        </Group>
        {common.map(
          ([label, values]) =>
            values.length > 0 && (
              <Text key={label} size={"xs"} c={"dimmed"}>
                {`${label}: ${values.join(", ")}`}
              </Text>
            ),
        )}
      </Stack>
    </Group>
  );
};

export { DailyGuessRow };
