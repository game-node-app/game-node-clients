import {
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconExternalLink } from "@tabler/icons-react";
import { DailyPlayResponseDto } from "@repo/wrapper/server";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { DailyShareButton } from "#@/components/daily/result/DailyShareButton";
import { DAILY_RESULT_STYLES } from "#@/components/daily/util/dailyModes";
import { DailyCountdown } from "#@/components/daily/view/DailyCountdown";
import { Link } from "#@/util/link";

interface Props {
  play: DailyPlayResponseDto;
  /** Shows the time until the next puzzles. */
  nextResetAt?: string;
}

const DailyResultPanel = ({ play, nextResetAt }: Props) => {
  const { t } = useTranslation();
  const { answer, community } = play;
  const won = play.status === "won";
  const { color, icon: StatusIcon } =
    DAILY_RESULT_STYLES[won ? "correct" : "wrong"];

  return (
    <Paper withBorder p={"md"} className={"w-full"}>
      <Stack>
        <Group role={"status"} className={"flex-nowrap"}>
          <ThemeIcon variant={"light"} color={color} radius={"xl"} size={"lg"}>
            <StatusIcon size={20} />
          </ThemeIcon>
          <Title order={3} c={color}>
            {won
              ? t("daily.result.won", { attempts: play.attempts })
              : t("daily.result.lost")}
          </Title>
        </Group>
        {answer && (
          <Group className={"flex-nowrap items-start"}>
            <Image
              src={
                getSizedImageUrl(
                  answer.coverUrl ?? undefined,
                  ImageSize.COVER_BIG,
                ) ?? "/img/game_placeholder.jpeg"
              }
              alt={""}
              w={96}
              radius={"sm"}
            />
            <Stack className={"gap-1 items-start"}>
              <Text size={"sm"} c={"dimmed"}>
                {t("daily.result.answer")}
              </Text>
              <Text fw={700} fz={"lg"}>
                {answer.name}
              </Text>
              {answer.year && <Text c={"dimmed"}>{answer.year}</Text>}
              <Button
                component={Link}
                href={`/game/${answer.id}`}
                variant={"default"}
                size={"compact-sm"}
                rightSection={<IconExternalLink size={14} />}
              >
                {t("daily.result.openGame")}
              </Button>
            </Stack>
          </Group>
        )}
        {community && (
          <Text size={"sm"} c={"dimmed"}>
            {t("daily.result.community", {
              players: community.players,
              average: community.averageAttempts.toFixed(1),
            })}
          </Text>
        )}
        <Group>
          <DailyShareButton
            entries={[
              {
                modeLabel: t(`daily.modes.${play.mode}.name`),
                number: play.number,
                maxAttempts: play.maxAttempts,
                results: play.feedback.map((feedback) => feedback.result),
                hintUsed: play.hintAt != null,
              },
            ]}
          />
          {nextResetAt && <DailyCountdown nextResetAt={nextResetAt} />}
        </Group>
      </Stack>
    </Paper>
  );
};

export { DailyResultPanel };
