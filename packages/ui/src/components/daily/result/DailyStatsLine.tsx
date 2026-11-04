import { Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { DailyCommunityDto } from "@repo/wrapper/server";

interface Props {
  number: number;
  community?: DailyCommunityDto;
}

/**
 * "#N · X acertaram · média N tentativas"; only the number until someone solves it.
 */
const DailyStatsLine = ({ number, community }: Props) => {
  const { t, i18n } = useTranslation();
  const parts = [`#${number}`];
  if (community && community.players > 0) {
    parts.push(
      t("daily.statsLine.solved", {
        count: new Intl.NumberFormat(i18n.language).format(community.players),
      }),
      t("daily.statsLine.average", {
        average: new Intl.NumberFormat(i18n.language, {
          maximumFractionDigits: 1,
        }).format(community.averageAttempts),
      }),
    );
  }

  return (
    <Group className={"justify-center gap-2"}>
      {parts.map((part, index) => (
        <Text key={part} fz={13} fw={index === 0 ? 600 : 400} c={"dimmed"}>
          {index > 0 && <span className={"mr-2 opacity-60"}>·</span>}
          {part}
        </Text>
      ))}
    </Group>
  );
};

export { DailyStatsLine };
