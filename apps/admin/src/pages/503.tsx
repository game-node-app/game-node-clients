import React from "react";
import { Center, Container, Stack, Text, Title } from "@mantine/core";

const Index = () => {
    return (
        <Container fluid h={"80vh"}>
            <Stack className={"mt-[50%]"}>
                <Title size={"h4"} className={"text-center"}>
                    This page is still in development.
                </Title>
                <Text className={"text-center"}>Come back soon!</Text>
            </Stack>
        </Container>
    );
};

export default Index;
