"use client";

import { Button, Container, Group, Text, Title } from "@mantine/core";
import {
    IconArrowRight,
    IconExternalLink,
    IconStar,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import classes from "./HeroSection.module.css";
import MainAppLink from "@/components/general/MainAppLink";

export function HeroSection() {
    const router = useRouter();

    return (
        <Container pt="sm" size="lg">
            <div className={classes.inner}>
                <Title className={classes.title}>GameNode Admin</Title>

                <Text className={classes.description} mt={30}>
                    This web dashboard helps our admins and moderators keep
                    GameNode secure and usable for you.
                </Text>

                <Group mt={40}>
                    <Button
                        size="lg"
                        className={classes.control}
                        onClick={() => {
                            router.push("/dashboard");
                        }}
                        rightSection={<IconArrowRight />}
                    >
                        Get started
                    </Button>
                    <MainAppLink href={"/"}>
                        <Button
                            variant="outline"
                            size="lg"
                            className={classes.control}
                            rightSection={<IconExternalLink />}
                        >
                            I'm lost
                        </Button>
                    </MainAppLink>
                </Group>
            </div>
        </Container>
    );
}
