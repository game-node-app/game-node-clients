import React from "react";
import {
    Container,
    Flex,
    Group,
    Image,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";

const About = () => {
    return (
        <Container fluid p={0}>
            <SimpleGrid
                w={"100%"}
                cols={{
                    base: 1,
                    lg: 2,
                }}
                className={"p-2 mb-8"}
            >
                <Flex className={"w-full h-full items-center"}>
                    <Text className={"text-center lg:text-start"}>
                        Welcome to GameNode, where the community is the key to
                        review and recommend the best games in the market! You
                        can search games by platforms, genres and popularity,
                        and find detailed reviews made by our users.
                    </Text>
                </Flex>
                <Image
                    alt={"Preview of a GameNode design"}
                    src={"/img/about_preview_1.png"}
                />

                <Image
                    alt={"Another of a GameNode design"}
                    src={"/img/about_preview_2.png"}
                />
                <Flex className={"w-full h-full items-center"}>
                    <Text className={"text-center lg:text-start"}>
                        With our website, you will have access to a community of
                        avid gamers which are always ready to share their
                        opinion. You can also connect with your friends and get
                        the latest news and updates on games.
                    </Text>
                </Flex>
                <Stack className={" h-full justify-center w-fit"}>
                    <Text className={"text-center lg:text-start"}>
                        Join our community on Discord or contribute with our
                        code on Github.
                    </Text>
                    <Flex className={"w-full justify-center lg:justify-start"}>
                        <a href={"https://discord.gg/8cPtfHtk"}>
                            <Image
                                alt={"Discord button"}
                                src={"/img/about_button_discord.png"}
                                className={"w-40"}
                            />
                        </a>
                    </Flex>
                </Stack>
                <Stack className={"h-full justify-center w-full"}>
                    <Text className={"text-center lg:text-end"}>
                        Help us keep GameNode alive and ad-free by donating in
                        our Patreon
                    </Text>
                    <Flex className={"w-full justify-center lg:justify-end"}>
                        <a href={"https://patreon.com/GameNodeApp"}>
                            <Image
                                alt={"Patreon button"}
                                src={"/img/about_button_patreon.png"}
                                className={"w-40"}
                            />
                        </a>
                    </Flex>
                </Stack>
            </SimpleGrid>
        </Container>
    );
};

export default About;
