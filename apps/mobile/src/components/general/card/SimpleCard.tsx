import React from "react";
import { Box, Center, Text } from "@mantine/core";

interface ISimpleCardProps {
    text: string;
}

const SimpleCard = ({ text }: ISimpleCardProps) => {
    return (
        <Box
            className="min-w-[15rem] min-h-[15rem] max-h-[15rem] max-w-[15rem] w-22 lg:w-32 bg-brand-7
        flex flex-col items-center justify-center"
        >
            <Center>
                <Text ta="center" className="!text-lg break-words p-md">
                    {text}
                </Text>
            </Center>
        </Box>
    );
};

export default SimpleCard;
