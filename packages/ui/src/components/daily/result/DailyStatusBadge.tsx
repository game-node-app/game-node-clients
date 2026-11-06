import { Badge } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  result?: { status: string; attempts: number };
}

const DailyStatusBadge = ({ result }: Props) => {
  const { t } = useTranslation();
  if (!result) {
    return (
      <Badge variant={"light"} color={"gray"}>
        {t("daily.status.notPlayed")}
      </Badge>
    );
  }
  if (result.status === "won") {
    return (
      <Badge variant={"light"} color={"teal"}>
        {t("daily.status.won", { attempts: result.attempts })}
      </Badge>
    );
  }
  if (result.status === "lost") {
    return (
      <Badge variant={"light"} color={"red"}>
        {t("daily.status.lost")}
      </Badge>
    );
  }
  return (
    <Badge variant={"light"} color={"yellow"}>
      {t("daily.status.inProgress")}
    </Badge>
  );
};

export { DailyStatusBadge };
