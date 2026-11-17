import { ActionIcon, Button, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCalendar, IconClock, IconHelp } from "@tabler/icons-react";
import { useDailyRemaining } from "#@/components/daily/ranking/useDailyRemaining";
import { useDailyCountdown } from "#@/components/daily/view/DailyCountdown";
import { Link } from "#@/util/link";

export interface DailyPlayHeaderCountdown {
  endsAt: string;
  label: string;
  /** "clock" ticks HH:MM:SS (the daily reset); "remaining" shows "3d 14h". */
  format?: "clock" | "remaining";
}

interface Props {
  title: string;
  subtitle: string;
  countdown?: DailyPlayHeaderCountdown;
  /** Omitted where there is no archive (weekly, practice). */
  archiveHref?: string;
  onHowToPlay: () => void;
}

const CountdownContent = ({
  label,
  time,
}: {
  label: string;
  time?: string;
}) => {
  if (time == undefined) return null;

  return (
    <Group className={"gap-2 flex-nowrap"}>
      <IconClock size={16} className={"text-dimmed shrink-0"} />
      <Stack className={"gap-0"}>
        <Text fz={11} lh={1.2} c={"dimmed"}>
          {label}
        </Text>
        <Text fz={14} lh={1.2} fw={700} className={"tabular-nums"}>
          {time}
        </Text>
      </Stack>
    </Group>
  );
};

const ClockCountdown = ({ endsAt, label }: DailyPlayHeaderCountdown) => (
  <CountdownContent label={label} time={useDailyCountdown(endsAt)} />
);

const RemainingCountdown = ({ endsAt, label }: DailyPlayHeaderCountdown) => (
  <CountdownContent label={label} time={useDailyRemaining(endsAt)} />
);

/**
 * Countdown, the title with its subtitle, and the how-to-play and archive actions.
 */
const DailyPlayHeader = ({
  title,
  subtitle,
  countdown,
  archiveHref,
  onHowToPlay,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className={"grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2"}>
      <div>
        {countdown &&
          (countdown.format === "remaining" ? (
            <RemainingCountdown {...countdown} />
          ) : (
            <ClockCountdown {...countdown} />
          ))}
      </div>
      <Link
        href={"/daily"}
        className={
          "flex flex-col items-center text-center text-inherit no-underline"
        }
      >
        <Title order={1} fz={{ base: 18, sm: 22 }} lh={1.2}>
          {title}
        </Title>
        <Text
          fz={12}
          fw={600}
          tt={"uppercase"}
          lts={"0.2em"}
          className={"text-brand-5"}
        >
          {subtitle}
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
        {archiveHref && (
          <>
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
          </>
        )}
      </Group>
    </div>
  );
};

export { DailyPlayHeader };
