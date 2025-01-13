import React, { useMemo } from "react";
import { useReviewsScore } from "@/components/review/hooks/useReviewsScore";
import CenteredLoading from "@/components/general/CenteredLoading";
import { DetailsBox } from "@/components/general/DetailsBox";
import {
    Box,
    Center,
    Divider,
    Flex,
    Group,
    Popover,
    Rating,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import GameRating from "@/components/general/input/GameRating";

interface ScoreDistribution {
    rating: number;
    percentage: number;
}

interface Props {
    gameId: number;
}

const GameInfoScore = ({ gameId }: Props) => {
    const score = useReviewsScore(gameId);
    const scoreDistribution = useMemo(() => {
        if (score.data == undefined || score.data.distribution == undefined)
            return (
                <Text fz={"sm"}>
                    We do not have enough reviews for this game.
                </Text>
            );

        return Object.entries(score.data.distribution)
            .toReversed()
            .map(([k, v], index, arr) => {
                if (k === "total") return null;
                const total = score.data.distribution.total;
                const percentage = (v / total) * 100;
                const percentageToUse = Number.isNaN(percentage)
                    ? 0
                    : Math.trunc(percentage);
                const lastElement = index + 1 === arr.length;
                return (
                    <Stack
                        key={k}
                        miw={{
                            base: "50vw",
                            lg: "10vw",
                        }}
                    >
                        <Group justify={"space-between"} w={"100%"}>
                            <Group gap={0}>
                                <Text fz={"sm"}>{k}</Text>
                                <Text fz={"sm"}>
                                    <IconStar size={"0.8rem"} />
                                </Text>
                            </Group>

                            <Text fz={"sm"}>{percentageToUse}%</Text>
                        </Group>
                        {!lastElement && <Divider />}
                    </Stack>
                );
            });
    }, [score.data]);
    return (
        <DetailsBox withBorder withDimmedTitle title={"User Rating"}>
            <Popover>
                <Popover.Target>
                    <Center className={"mt-6 mb-6"}>
                        <GameRating value={score.data?.median} />
                    </Center>
                </Popover.Target>
                <Popover.Dropdown>
                    <Stack>{scoreDistribution}</Stack>
                </Popover.Dropdown>
            </Popover>
        </DetailsBox>
    );
};

export default GameInfoScore;
