import { useEffect, useState } from "react";
import { Text, TextProps } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";

interface Props extends TextProps {
  nextResetAt: string;
}

const pad = (value: number) => `${Math.floor(value)}`.padStart(2, "0");

const DailyCountdown = ({ nextResetAt, ...others }: Props) => {
  const { t } = useTranslation();
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

  if (remaining == undefined) return null;
  const seconds = remaining / 1000;

  return (
    <Text c={"dimmed"} {...others}>
      {t("daily.nextPuzzleIn", {
        time: `${pad(seconds / 3600)}:${pad((seconds % 3600) / 60)}:${pad(seconds % 60)}`,
      })}
    </Text>
  );
};

export { DailyCountdown };
