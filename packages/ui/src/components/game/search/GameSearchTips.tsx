import { Box, BoxProps, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useEffect, useState } from "react";

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

const GameSearchTips = ({ ...others }: BoxProps) => {
  const { t } = useTranslation();
  const [randomTip, setRandomTip] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Keep random content out of server rendering and the hydration pass.
    const timer = setTimeout(
      () =>
        setRandomTip(
          getRandomItem([
            t("game.searchTips.pressHold"),
            t("game.searchTips.acronym"),
          ]),
        ),
      0,
    );
    return () => clearTimeout(timer);
  }, [t]);

  if (!randomTip) return null;

  return (
    <Box className={"w-full"} {...others}>
      <Text className={"text-start text-xs text-dimmed"}>
        {t("game.labels.tip")}: {randomTip}
      </Text>
    </Box>
  );
};

export { GameSearchTips };
