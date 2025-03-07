import React, { ComponentPropsWithoutRef } from "react";
import {
  getCoverUrl,
  getSizedImageUrl,
  ImageSize,
  useGame,
} from "#@/components";
import { Avatar, Group, Skeleton, Title } from "@mantine/core";
import { Link } from "#@/util";

interface Props extends Omit<ComponentPropsWithoutRef<typeof Link>, "href"> {
  gameId: number;
  withTitle?: boolean;
}

const GameTitleWithFigure = ({
  gameId,
  withTitle = true,
  ...others
}: Props) => {
  const { data, isLoading } = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  const coverUrl = getCoverUrl(data);

  const sizedCoverUrl = getSizedImageUrl(coverUrl, ImageSize.THUMB);

  if (isLoading) {
    return <Skeleton className={"h-8 w-40"} />;
  }

  return (
    <Link {...others} href={`/game/${gameId}`}>
      <Group className={"gap-3 flex-nowrap"}>
        <Avatar src={sizedCoverUrl} size={"md"} />
        {withTitle && <Title size={"h5"}>{data?.name}</Title>}
      </Group>
    </Link>
  );
};

export { GameTitleWithFigure };
