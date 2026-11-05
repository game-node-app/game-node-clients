import { useEffect, useState } from "react";
import { Badge, BadgeProps } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";
import { IconClock } from "@tabler/icons-react";
import { cn } from "#@/util/cn";

interface Props extends BadgeProps {
  nextResetAt: string;
}

const pad = (value: number) => `${Math.floor(value)}`.padStart(2, "0");

/**
 * "HH:MM:SS" until the reset, ticking every second; undefined until mounted.
 * Refreshes the Daily queries once the time is up.
 */
export function useDailyCountdown(nextResetAt: string) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState<number>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- set on mount so the server render matches the first client render
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining =
    now == undefined ? undefined : Math.max(Date.parse(nextResetAt) - now, 0);
  const expired = remaining === 0;

  useEffect(() => {
    if (!expired) return;
    // The global staleTime is Infinity; keep retrying in case our clock runs ahead of the server's.
    const refresh = () =>
      queryClient.invalidateQueries({ queryKey: ["daily"] });
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [expired, queryClient]);

  if (remaining == undefined) return undefined;
  const seconds = remaining / 1000;
  return `${pad(seconds / 3600)}:${pad((seconds % 3600) / 60)}:${pad(seconds % 60)}`;
}

const DailyCountdown = ({ nextResetAt, className, ...others }: Props) => {
  const { t } = useTranslation();
  const time = useDailyCountdown(nextResetAt);
  if (time == undefined) return null;

  return (
    <Badge
      variant={"default"}
      size={"lg"}
      tt={"none"}
      // Fixed-width digits keep the badge from jittering every second.
      className={cn("tabular-nums", className)}
      leftSection={<IconClock size={14} />}
      {...others}
    >
      {t("daily.nextPuzzleIn", { time })}
    </Badge>
  );
};

export { DailyCountdown };
