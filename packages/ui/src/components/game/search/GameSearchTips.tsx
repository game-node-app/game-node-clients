import React, { useEffect, useMemo, useState } from "react";
import { Box, BoxProps, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

const GameSearchTips = ({ ...others }: BoxProps) => {
  const { t } = useTranslation();
  const TIPS = [t("game.searchTips.pressHold"), t("game.searchTips.acronym")];
  const [randomTip, setRandomTip] = useState<string | undefined>(undefined);

  useEffect(() => {
    setRandomTip(getRandomItem(TIPS));
  }, []);

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
