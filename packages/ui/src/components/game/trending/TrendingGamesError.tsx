import { Button, Text } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";

interface TrendingGamesErrorProps {
  onRetry: () => void;
  /** A retry is in flight. */
  retrying?: boolean;
  className?: string;
}

/** Compact inline error for the trending hero and shelves, with a retry action. */
const TrendingGamesError = ({
  onRetry,
  retrying,
  className,
}: TrendingGamesErrorProps) => {
  const { t } = useTranslation();
  return (
    <div
      role={"alert"}
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl bg-paper-8 px-4 py-2",
        className,
      )}
    >
      <Text size={"sm"} c={"dimmed"} className={"min-w-0 flex-1"}>
        {t("home.trendingError")}
      </Text>
      <Button
        variant={"default"}
        size={"sm"}
        loading={retrying}
        leftSection={<IconRefresh size={16} />}
        style={{ minHeight: 44 }}
        onClick={onRetry}
      >
        {t("actions.retry")}
      </Button>
    </div>
  );
};

export { TrendingGamesError };
