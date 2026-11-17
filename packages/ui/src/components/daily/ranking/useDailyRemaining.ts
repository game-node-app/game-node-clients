import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDailyRemaining } from "#@/components/daily/ranking/rankingFormat";

const TICK_MS = 30_000;

/**
 * Time left until `endsAt` ("3d 14h"), refreshed every 30 s; undefined until
 * mounted or without an end. Refreshes the Daily queries once it passes.
 */
export function useDailyRemaining(endsAt: string | null | undefined) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState<number>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- set on mount so the server render matches the first client render
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const expired =
    endsAt != undefined && now != undefined && Date.parse(endsAt) <= now;

  useEffect(() => {
    if (!expired) return;
    void queryClient.invalidateQueries({ queryKey: ["daily"] });
  }, [expired, queryClient]);

  if (!endsAt || now == undefined) return undefined;
  return formatDailyRemaining(endsAt, now);
}
