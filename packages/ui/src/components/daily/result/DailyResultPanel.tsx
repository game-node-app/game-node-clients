import { Group, Image, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { DailyPlayResponseDto } from "@repo/wrapper/server";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { DailyShareButton } from "#@/components/daily/result/DailyShareButton";
import { DailyStatsPanel } from "#@/components/daily/result/DailyStatsPanel";
import { Link } from "#@/util/link";

interface Props {
  play: DailyPlayResponseDto;
}

const DailyResultPanel = ({ play }: Props) => {
  const { t } = useTranslation();
  const { answer, community } = play;
  const won = play.status === "won";

  return (
    <Paper withBorder p={"md"} className={"w-full"}>
      <Stack>
        <Title order={3} c={won ? "teal" : "red"}>
          {won
            ? t("daily.result.won", { attempts: play.attempts })
            : t("daily.result.lost")}
        </Title>
        {answer && (
          <Link href={`/game/${answer.id}`}>
            <Group className={"flex-nowrap"}>
              <Image
                src={
                  getSizedImageUrl(
                    answer.coverUrl ?? undefined,
                    ImageSize.COVER_BIG,
                  ) ?? "/img/game_placeholder.jpeg"
                }
                alt={answer.name}
                w={96}
                radius={"sm"}
              />
              <Stack className={"gap-0"}>
                <Text size={"sm"} c={"dimmed"}>
                  {t("daily.result.answer")}
                </Text>
                <Text fw={700} fz={"lg"} className={"underline"}>
                  {answer.name}
                </Text>
                {answer.year && <Text c={"dimmed"}>{answer.year}</Text>}
              </Stack>
            </Group>
          </Link>
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
        </Group>
        <DailyStatsPanel mode={play.mode} maxAttempts={play.maxAttempts} />
      </Stack>
    </Paper>
  );
};

export { DailyResultPanel };
