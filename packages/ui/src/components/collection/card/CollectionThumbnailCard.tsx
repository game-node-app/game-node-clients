import React, { useMemo, useRef } from "react";
import {
  getCoverUrl,
  getSizedImageUrl,
  ImageSize,
  useCollection,
  useCollectionEntriesForCollectionId,
  useGames,
} from "#@/components";
import { Card, Image, Stack, Title, Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { Link } from "#@/util";
import Autoplay from "embla-carousel-autoplay";
import { buildPresenterFallback } from "#@/presenters";

export interface CollectionThumbnailCardProps {
  collectionId: string;
}

const DEFAULT_CollectionThumbnailCard = ({
  collectionId,
}: CollectionThumbnailCardProps) => {
  const autoplay = useRef(Autoplay({ delay: 4000 }));
  const collectionQuery = useCollection(collectionId);
  const entriesQuery = useCollectionEntriesForCollectionId({
    collectionId,
    offset: 0,
    limit: 10,
    orderBy: {
      addedDate: "DESC",
    },
  });

  const gameIds = entriesQuery.data?.data.map((entry) => entry.gameId) ?? [];

  const gamesQuery = useGames({
    gameIds,
    relations: {
      cover: true,
    },
  });

  const carouselSlides = useMemo(() => {
    if (gamesQuery.data == undefined || gamesQuery.data.length === 0)
      return [
        <Carousel.Slide key={collectionId + "placeholder-image"}>
          <Image
            src={"/img/game_placeholder.jpeg"}
            className={"w-full h-full object-cover"}
          />
        </Carousel.Slide>,
      ];

    return gamesQuery.data.map((game) => {
      const coverUrl = getCoverUrl(game)!;
      const sizedCoverUrl = getSizedImageUrl(coverUrl, ImageSize.COVER_BIG_2X);
      return (
        <Carousel.Slide key={game.id}>
          <Image src={sizedCoverUrl} className={"w-full h-full object-cover"} />
        </Carousel.Slide>
      );
    });
  }, [collectionId, gamesQuery.data]);

  return (
    <Card shadow="sm" padding="md" radius="md" bg={"#161616"}>
      <Card.Section>
        <Carousel
          plugins={[autoplay.current]}
          height={200}
          withControls={false}
          withIndicators
          slideGap={"xs"}
          slideSize={"100%"}
          emblaOptions={{
            loop: true,
          }}
          classNames={{
            indicator: "w-2 h-2 rounded-xl",
          }}
        >
          {carouselSlides}
        </Carousel>
      </Card.Section>
      <Link
        href={`/library/${collectionQuery.data?.libraryUserId}/collection/${collectionId}`}
      >
        <Stack className={"mt-4 gap-2"}>
          <Title size={"h4"}>{collectionQuery.data?.name}</Title>
          <Text className={"text-dimmed"}>
            {collectionQuery.data?.description}
          </Text>
        </Stack>
      </Link>
    </Card>
  );
};

const CollectionThumbnailCard = buildPresenterFallback(
  "CollectionThumbnailCard",
  DEFAULT_CollectionThumbnailCard,
);

export { CollectionThumbnailCard };
