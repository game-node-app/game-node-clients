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
  Tooltip,
  Transition,
} from "@mantine/core";
import SimpleCard from "@/components/general/card/SimpleCard";
import { IconChevronDown } from "@tabler/icons-react";
import React, { useEffect, useRef } from "react";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useRouter } from "next/router";
import Link from "next/link";
import { getServerStoredIcon } from "@repo/ui";

export default function Home() {
  const session = useSessionContext();
  const router = useRouter();
  // useEffect(() => {
  //     if (!session.loading && session.doesSessionExist) {
  //         router.replace("/search");
  //     }
  // }, [session, router]);
  return (
    <Stack className={"w-full h-full min-h-screen items-center"}>
      <Title size={"h1"} className={"text-center mt-10"}>
        Manage all your games <br />
        In a single place
      </Title>
      <Text ta={"center"}>
        GameNode is the perfect platform to manage your game collection
        virtually. Update your backlog, rate the titles you've played, and add
        the most anticipated releases to your wishlist. Connect with friends,
        follow their activities, and keep track of everyone's latest gaming
        sessions.
      </Text>
      <Link href={"/search"}>
        <Button size={"xl"} className={"bg-brand-5 min-w-44 mt-5"}>
          Join in
        </Button>
      </Link>

      <Stack className={"items-center"}>
        <Anchor
          className={"w-44 mt-8"}
          href={
            "https://play.google.com/store/apps/details?id=app.gamenode&pcampaignid=web_share"
          }
        >
          <Image
            src={"/img/google_play_badge_english.png"}
            alt={"Get it on Google Play badge"}
          />
        </Anchor>
        <Text className={"text-sm"}>Soon in iOS</Text>
      </Stack>
      <Stack className={"items-center mt-16"}>
        <Text className={"text-center"}>
          Too lazy to import your entire library? Don't worry, we got you!
        </Text>
        <Group className={"justify-center"}>
          <Image
            w={38}
            src={getServerStoredIcon("psn")}
            alt={"Playstation Network"}
          />
          <Image w={38} src={getServerStoredIcon("steam")} alt={"Steam"} />
        </Group>
        <Text className={"text-sm text-dimmed"}>
          GameNode can import games and{" "}
          <Tooltip label={"Only for sources which export playtime info."}>
            <Text span className={"text-sm"}>
              playtime*
            </Text>
          </Tooltip>{" "}
          from these sources. More will be available soon.
        </Text>
      </Stack>
      <Text className={"mt-16 text-sm"}>
        Games metadata are a courtesy of{" "}
        <Anchor href={"https://igdb.com"} target={"_blank"}>
          IGDB
        </Anchor>
      </Text>
    </Stack>
  );
}
