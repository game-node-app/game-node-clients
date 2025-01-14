import React from "react";
import { Group, Skeleton, Stack, Text } from "@mantine/core";

interface Props {
    name: string;
    // Assumed to be in seconds
    value: number | null | undefined;
    isLoading: boolean;
}

const GameInfoPlaytimeItem = ({ name, value, isLoading }: Props) => {
    const valueToUse = value ?? 0;
    const valueHours = Math.ceil(valueToUse / 3600);
    return (
        <Group className={"flex-nowrap gap-0 w-full"}>
            <Stack
                className={
                    "items-center w-1/2 h-10 justify-center bg-[#1F1F1F] border-[#2E2E2E] border-[1px] rounded-l"
                }
            >
                {name}
            </Stack>
            {isLoading ? (
                <Skeleton className={"w-1/2 h-10"} />
            ) : (
                <Stack
                    className={
                        "items-center font-bold w-1/2 h-10 justify-center bg-[#F15025] border-[#2E2E2E] border-[1px] rounded-r"
                    }
                >
                    {valueHours === 0 ? "Not Available" : `${valueHours} Hours`}
                </Stack>
            )}
        </Group>
    );
};

export default GameInfoPlaytimeItem;
