import React, { useEffect, useMemo, useState } from "react";
import { Box, BoxProps, Text } from "@mantine/core";

function getRandomItem<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
}

const TIPS = [
    "Press and hold on a game's cover to quickly add it to your library",
    "You can also search for games' acronyms (e.g. tw3, gow)",
];

const GameSearchTips = ({ ...others }: BoxProps) => {
    const [randomTip, setRandomTip] = useState<string | undefined>(undefined);

    useEffect(() => {
        setRandomTip(getRandomItem(TIPS));
    }, []);

    if (!randomTip) return null;

    return (
        <Box className={"w-full"} {...others}>
            <Text className={"text-start text-xs text-dimmed"}>
                Tip: {randomTip}
            </Text>
        </Box>
    );
};

export default GameSearchTips;
