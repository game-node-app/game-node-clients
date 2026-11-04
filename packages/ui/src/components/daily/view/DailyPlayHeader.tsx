import { ActionIcon, Button, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCalendar, IconClock, IconHelp } from "@tabler/icons-react";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { useDailyCountdown } from "#@/components/daily/view/DailyCountdown";
import { Link } from "#@/util/link";

interface Props {
  mode: DailyMode;
  nextResetAt?: string;
  onHowToPlay: () => void;
}

const Countdown = ({ nextResetAt }: { nextResetAt: string }) => {
  const { t } = useTranslation();
  const time = useDailyCountdown(nextResetAt);
  if (time == undefined) return null;

  return (
    <Group className={"gap-2 flex-nowrap"}>
      <IconClock size={16} className={"text-dimmed shrink-0"} />
      <Stack className={"gap-0"}>
        <Text fz={11} lh={1.2} c={"dimmed"}>
          {t("daily.nextIn")}
        </Text>
        <Text fz={14} lh={1.2} fw={700} className={"tabular-nums"}>
          {time}
        </Text>
      </Stack>
    </Group>
  );
};

/**
 * Countdown, the Daily title with the current mode, and the how-to-play and archive actions.
 */
const DailyPlayHeader = ({ mode, nextResetAt, onHowToPlay }: Props) => {
  const { t } = useTranslation();
  const archiveHref = `/daily/${mode}/archive`;

  return (
    <div className={"grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2"}>
      <div>{nextResetAt && <Countdown nextResetAt={nextResetAt} />}</div>
      <Link
        href={"/daily"}
        className={"flex flex-col items-center text-inherit no-underline"}
      >
        <Title order={1} fz={{ base: 18, sm: 22 }} lh={1.2}>
          GameNode Daily
        </Title>
        <Text
          fz={12}
          fw={600}
          tt={"uppercase"}
          lts={"0.2em"}
          className={"text-brand-5"}
        >
          {t(`daily.modes.${mode}.name`)}
        </Text>
      </Link>
      <Group className={"justify-end gap-2 flex-nowrap"}>
        <Button
          variant={"default"}
          leftSection={<IconHelp size={16} />}
          onClick={onHowToPlay}
          visibleFrom={"md"}
        >
          {t("daily.howToPlay.button")}
        </Button>
        <ActionIcon
          variant={"subtle"}
          color={"gray"}
          size={"lg"}
          onClick={onHowToPlay}
          hiddenFrom={"md"}
          aria-label={t("daily.howToPlay.button")}
        >
          <IconHelp size={20} />
        </ActionIcon>
        <Button
          component={Link}
          href={archiveHref}
          variant={"default"}
          leftSection={<IconCalendar size={16} />}
          visibleFrom={"md"}
        >
          {t("daily.archive.link")}
        </Button>
        <ActionIcon
          component={Link}
          href={archiveHref}
          variant={"subtle"}
          color={"gray"}
          size={"lg"}
          hiddenFrom={"md"}
          aria-label={t("daily.archive.link")}
        >
          <IconCalendar size={20} />
        </ActionIcon>
      </Group>
    </div>
  );
};

export { DailyPlayHeader };
