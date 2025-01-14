import React from "react";
import { Center, Title } from "@mantine/core";

const GameSearchResultErrorMessage = ({ message }: { message: string }) => {
    return (
        <Center>
            <Title size="h4">{message}</Title>
        </Center>
    );
};

export default GameSearchResultErrorMessage;
