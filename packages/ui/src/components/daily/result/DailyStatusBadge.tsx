import { Badge } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconPlayerPlay } from "@tabler/icons-react";
import {
  DAILY_RESULT_STYLES,
  DAILY_STATUS_KIND,
} from "#@/components/daily/util/dailyModes";

interface Props {
  result?: { status: string; attempts: number };
}

const DailyStatusBadge = ({ result }: Props) => {
  const { t } = useTranslation();
  const { color, icon: ResultIcon } =
    DAILY_RESULT_STYLES[
      (result && DAILY_STATUS_KIND[result.status]) || "skipped"
    ];
  const StatusIcon =
    result?.status === "in_progress" ? IconPlayerPlay : ResultIcon;
  const label = !result
    ? t("daily.status.notPlayed")
    : result.status === "won"
      ? t("daily.status.won", { attempts: result.attempts })
      : result.status === "lost"
        ? t("daily.status.lost")
        : t("daily.status.inProgress");

  return (
    <Badge
      variant={"light"}
      color={color}
      leftSection={<StatusIcon size={12} />}
    >
      {label}
    </Badge>
  );
};

export { DailyStatusBadge };
