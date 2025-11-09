import React from "react";
import { UserPlaytimeDto } from "@repo/wrapper/server";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useGame } from "#@/components/game/hooks/useGame";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { Box, Group, Image, Overlay, Stack, Text, Title } from "@mantine/core";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { getCapitalizedText } from "#@/util/getCapitalizedText";
import { cn, Link } from "#@/util";

interface Props {
  playtime: UserPlaytimeDto;
  variant?: "compact" | "detailed" | "simple";
}

const UserPlaytimeItem = ({ playtime, variant = "detailed" }: Props) => {
  const onMobile = useOnMobile();

  const gameId = playtime.gameId;
  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  const imageUrl = getSizedImageUrl(
    gameQuery.data?.cover?.url,
    onMobile ? ImageSize.SCREENSHOT_MED : ImageSize.SCREENSHOT_BIG,
  );

  const withBackground = variant === "detailed";
  const withTitle = variant === "detailed" || variant === "simple";

  return (
    <Box
      style={
        variant === "detailed"
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
      className={cn("relative w-full min-h-11 px-4 py-2", {
        "h-28 rounded-md": variant === "detailed",
        "bg-paper-4 rounded-md": variant === "simple",
      })}
    >
      {variant === "detailed" && (
        <Overlay backgroundOpacity={0.8} className={"z-0 rounded-sm"}></Overlay>
      )}
      <Group className={"w-full h-full relative z-20 items-center flex-nowrap"}>
        {withTitle && (
          <Link
            href={`/game/${gameQuery.data?.id}`}
            className={cn(
              "flex flex-nowrap w-32 items-center justify-center h-full",
              {
                "w-24": variant === "detailed",
              },
            )}
          >
            <Title className={"text-sm lg:text-md text-center line-clamp-2"}>
              {gameQuery.data?.name}
            </Title>
          </Link>
        )}
        <Group
          className={
            withTitle
              ? "ms-auto w-5/12 justify-end items-center flex-nowrap gap-8"
              : withBackground
                ? "w-full flex-nowrap mx-4"
                : "w-full flex-nowrap"
          }
        >
          <Group className={"w-full flex-nowrap"}>
            <Text className={"text-sm lg:text-md"}>
              Recent
              <br />
              <Text span className={"text-dimmed text-sm"}>
                {Math.ceil(playtime.recentPlaytimeSeconds / 3600)}h
              </Text>
            </Text>
            <Text className={"text-sm lg:text-md"}>
              Total <br />
              <Text span className={"text-dimmed text-sm"}>
                {Math.ceil(playtime.totalPlaytimeSeconds / 3600)}h
              </Text>
            </Text>
          </Group>

          <Image
            w={32}
            alt={getCapitalizedText(playtime.platform.name)}
            src={getServerStoredIcon(playtime.source.toLowerCase())}
          />
        </Group>
      </Group>
    </Box>
  );
};

export { UserPlaytimeItem };
