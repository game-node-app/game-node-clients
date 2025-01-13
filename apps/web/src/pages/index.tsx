import {
    ActionIcon,
    Anchor,
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Grid,
    Group,
    Image,
    SimpleGrid,
    Space,
    Stack,
    Text,
    Title,
    Transition,
} from "@mantine/core";
import SimpleCard from "@/components/general/card/SimpleCard";
import { IconChevronDown } from "@tabler/icons-react";
import React, { useEffect, useRef } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
    const cardGridRef = useRef<HTMLDivElement>(null);
    const session = useSessionContext();
    const router = useRouter();
    useEffect(() => {
        if (!session.loading && session.doesSessionExist) {
            router.replace("/search");
        }
    }, [session, router]);
    return (
        <Container fluid h={"100%"}>
            <Stack className="h-[80vh] mb-32 ">
                <Stack gap={0} className="mt-32 lg:mt-40 mb-8 w-full max-w-fit">
                    <Title size={"h1"} className="text-7xl">
                        Play. Review. Share.
                    </Title>

                    <Stack
                        className={
                            "mt-8 h-fit flex-col lg:flex-row lg:items-center"
                        }
                    >
                        <Link href={"/search"}>
                            <Button size={"lg"}>Join in</Button>
                        </Link>
                        <Divider label={"OR"} />
                        <Anchor
                            className={"w-44"}
                            href={
                                "https://play.google.com/store/apps/details?id=app.gamenode&pcampaignid=web_share"
                            }
                        >
                            <Image
                                src={"/img/google_play_badge_english.png"}
                                alt={"Get it on Google Play badge"}
                            />
                        </Anchor>
                    </Stack>
                </Stack>

                <Stack
                    gap={0}
                    align="center"
                    justify="flex-start"
                    className="mt-auto mb-xl"
                >
                    <ActionIcon
                        size={"xl"}
                        onClick={() =>
                            cardGridRef.current?.scrollIntoView({
                                behavior: "smooth",
                            })
                        }
                    >
                        <IconChevronDown size="4rem" />
                    </ActionIcon>
                </Stack>
            </Stack>
            <Grid
                px={"lg"}
                ref={cardGridRef}
                className=""
                align="center"
                w={"100%"}
                justify="center"
            >
                <Grid.Col
                    span={{
                        xs: 6,
                        lg: 3,
                    }}
                    className="flex justify-center"
                >
                    <SimpleCard text={"Organize your game library"} />
                </Grid.Col>
                <Grid.Col
                    span={{
                        xs: 6,
                        lg: 3,
                    }}
                    className="flex justify-center"
                >
                    <SimpleCard text={"Connect your platforms"} />
                </Grid.Col>
                <Grid.Col
                    span={{
                        xs: 6,
                        lg: 3,
                    }}
                    className="flex justify-center"
                >
                    <SimpleCard text={"Know where to play each game"} />
                </Grid.Col>
                <Grid.Col
                    span={{
                        xs: 6,
                        lg: 3,
                    }}
                    className="flex justify-center"
                >
                    <SimpleCard text={"Share your reviews"} />
                </Grid.Col>
            </Grid>
            <Space mb={"xl"} />
            <Title ta="center" size="h5">
                GameNode is free (and ad-free!).
            </Title>
            <Text c={"dimmed"} fz={"1rem"} className={"text-center"}>
                Games metadata are a courtesy of{" "}
                <a className={"text-blue-800"} href={"https://igdb.com"}>
                    IGDB
                </a>
                .
            </Text>

            <Space mb={"xl"} />
        </Container>
    );
}
