import React from "react";
import { BlogPostReview } from "@repo/wrapper/server";
import { GameRating, useGame } from "#@/components";
import { Group, Title } from "@mantine/core";
import { Link } from "#@/util";

interface Props {
  reviewInfo: BlogPostReview;
}

const BlogPostReviewInfo = ({ reviewInfo }: Props) => {
  const gameQuery = useGame(reviewInfo.gameId, {
    relations: {
      cover: true,
    },
  });

  return (
    <Group className={"w-full justify-between flex-nowrap"}>
      <Link href={`/game/${reviewInfo.gameId}`}>
        <Title size={"h4"} className={"max-w-fit text-wrap"}>
          {gameQuery.data?.name}
        </Title>
      </Link>

      <GameRating value={reviewInfo.rating} />
    </Group>
  );
};

export { BlogPostReviewInfo };
