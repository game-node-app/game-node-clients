import React from "react";
import { Button, Center, Stack, Title } from "@mantine/core";
import Link from "next/link";

const GlobalShellNavbarLoginPrompt = () => {
    return (
        <Center className="mt-8">
            <Stack justify="center">
                <Title size="h5">
                    Faça login para aproveitar todas as funcionalidades!
                </Title>
                <Link href={"/auth"}>
                    <Button variant="filled">Login</Button>
                </Link>
            </Stack>
        </Center>
    );
};

export default GlobalShellNavbarLoginPrompt;
