"use client";

import { ActionIcon, Anchor, Container, Group, Text } from "@mantine/core";
import {
    IconBrandDiscord,
    IconBrandGithub,
    IconBrandTwitter,
} from "@tabler/icons-react";
import classes from "./Footer.module.css";
import Link from "next/link";

export function Footer() {
    return (
        <div className={classes.footer}>
            <Container className={classes.inner}>
                <Text c="dimmed" fz="sm">
                    Built by the{" "}
                    <Anchor href="https://github.com/game-node-app" size="sm">
                        GameNode Team
                    </Anchor>
                </Text>
                <Group
                    gap={"xs"}
                    className={classes.links}
                    justify="flex-end"
                    wrap="nowrap"
                >
                    <Link
                        target={"_blank"}
                        href={"https://github.com/game-node-app"}
                    >
                        <ActionIcon size="lg" variant="default" radius="xl">
                            <IconBrandGithub size="1.05rem" stroke={1.5} />
                        </ActionIcon>
                    </Link>
                    <Link
                        target={"_blank"}
                        href={"https://discord.gg/8cPtfHtk"}
                    >
                        <ActionIcon size="lg" variant="default" radius="xl">
                            <IconBrandDiscord size="1.05rem" stroke={1.5} />
                        </ActionIcon>
                    </Link>
                    <Link
                        target={"_blank"}
                        href={"https://twitter.com/gamenodeapp"}
                    >
                        <ActionIcon size="lg" variant="default" radius="xl">
                            <IconBrandTwitter size="1.05rem" stroke={1.5} />
                        </ActionIcon>
                    </Link>
                </Group>
            </Container>
        </div>
    );
}
