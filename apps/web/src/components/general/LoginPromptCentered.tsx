import React from "react";
import { Button, Center, Stack, Title } from "@mantine/core";

const LoginPromptCentered = () => {
    return (
        <Center>
            <Stack>
                <Title size={"h4"}>
                    This action requires you to be logged in.
                </Title>
                <Button>Log in</Button>
            </Stack>
        </Center>
    );
};

export default LoginPromptCentered;
