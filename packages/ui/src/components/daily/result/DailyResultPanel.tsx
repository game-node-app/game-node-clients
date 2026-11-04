import {
  Badge,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconBookmark, IconExternalLink } from "@tabler/icons-react";
import { DailyPlayResponseDto } from "@repo/wrapper/server";
import { CollectionEntryEditModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryEditModal";
import { useGames } from "#@/components/game/hooks/useGames";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { DailyShareButton } from "#@/components/daily/result/DailyShareButton";
import {
  buildDailyShareText,
  DAILY_SHARE_URL,
} from "#@/components/daily/util/buildDailyShareText";
import { DAILY_RESULT_STYLES } from "#@/components/daily/util/dailyModes";
import { Link } from "#@/util/link";

interface Props {
  play: DailyPlayResponseDto;
}

/**
 * The answer, then the share preview, once the puzzle is finished.
 */
const DailyResultPanel = ({ play }: Props) => {
  const { t } = useTranslation();
  const [collectionOpened, collection] = useDisclosure(false);
  const { answer } = play;
  const won = play.status === "won";
  const { color, icon: StatusIcon } =
    DAILY_RESULT_STYLES[won ? "correct" : "wrong"];
  // The answer only carries its name and year; the meta line also names a genre and the platforms.
  const answerQuery = useGames({
    gameIds: answer ? [answer.id] : [],
    relations: { genres: true, platforms: true },
  });
  const details = answerQuery.data?.[0];
  const meta = [
    answer?.year,
    details?.genres?.[0]?.name,
    details?.platforms
      ?.map((platform) => platform.abbreviation)
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);

  return (
    <Stack className={"w-full gap-5"}>
      {answer && (
        <Paper
          withBorder
          radius={14}
          p={{ base: "md", sm: 24 }}
          className={"flex gap-4 sm:gap-6 !bg-paper-8"}
          style={{ borderColor: `var(--mantine-color-${color}-filled)` }}
        >
          <Image
            src={
              getSizedImageUrl(
                answer.coverUrl ?? undefined,
                ImageSize.COVER_BIG,
              ) ?? "/img/game_placeholder.jpeg"
            }
            alt={""}
            w={{ base: 96, sm: 150 }}
            h={{ base: 128, sm: 200 }}
            radius={8}
            className={"shrink-0"}
          />
          <Stack className={"gap-2 items-start min-w-0"}>
            <Badge
              role={"status"}
              variant={"light"}
              color={color}
              radius={"xl"}
              size={"lg"}
              tt={"none"}
              leftSection={<StatusIcon size={12} />}
            >
              {won
                ? t("daily.result.wonOf", {
                    attempts: play.attempts,
                    max: play.maxAttempts,
                  })
                : t("daily.result.lost")}
            </Badge>
            <Title order={2} fz={{ base: 22, sm: 28 }} lh={1.2}>
              {answer.name}
            </Title>
            {meta.length > 0 && (
              <Text fz={14} c={"dimmed"}>
                {meta.join(" · ")}
              </Text>
            )}
            <Group className={"gap-2 mt-auto"}>
              <Button
                component={Link}
                href={`/game/${answer.id}`}
                variant={"default"}
                rightSection={<IconExternalLink size={16} />}
              >
                {t("daily.result.openGame")}
              </Button>
              <Button
                variant={"subtle"}
                color={"gray"}
                leftSection={<IconBookmark size={16} />}
                onClick={collection.open}
              >
                {t("daily.result.addToCollection")}
              </Button>
            </Group>
          </Stack>
          <CollectionEntryEditModal
            opened={collectionOpened}
            onClose={collection.close}
            gameId={answer.id}
          />
        </Paper>
      )}
    </Stack>
  );
};

/**
 * The share text as it will be copied, with the copy action.
 */
const DailySharePanel = ({ play }: Props) => {
  const { t } = useTranslation();
  const entries = [
    {
      modeLabel: t(`daily.modes.${play.mode}.name`),
      number: play.number,
      maxAttempts: play.maxAttempts,
      results: play.feedback.map((feedback) => feedback.result),
      hintUsed: play.hintAt != null,
    },
  ];

  return (
    <Paper withBorder radius={14} p={20} className={"w-full !bg-paper-8"}>
      <Stack className={"gap-2.5"}>
        <Text fz={13} fw={600} c={"dimmed"} tt={"uppercase"} lts={"0.08em"}>
          {t("daily.share.title")}
        </Text>
        <Text
          component={"pre"}
          fz={15}
          className={"m-0 whitespace-pre-wrap rounded-lg bg-body p-4 font-sans"}
        >
          {buildDailyShareText(entries, DAILY_SHARE_URL)}
        </Text>
        <DailyShareButton
          variant={"default"}
          fullWidth
          entries={entries}
          label={t("daily.share.copy")}
        />
      </Stack>
    </Paper>
  );
};

export { DailyResultPanel, DailySharePanel };
