import { useEffect, useState } from "react";
import { Text } from "@mantine/core";
import { useMounted } from "@mantine/hooks";

/**
 * Hours:minutes clock for console top bars. Renders nothing until mounted, so SSR can't mismatch.
 */
const ConsoleClock = () => {
  const mounted = useMounted();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <Text className={"gn-console-clock"}>
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </Text>
  );
};

export { ConsoleClock };
