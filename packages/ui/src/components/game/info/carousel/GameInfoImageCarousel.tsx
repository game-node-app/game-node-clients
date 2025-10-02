import React, { useMemo } from "react";
import { Carousel, CarouselProps } from "@mantine/carousel";
import { Box, Image } from "@mantine/core";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { useGame } from "#@/components/game/hooks/useGame";
import { Game } from "@repo/wrapper/server";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { DEFAULT_GAME_INFO_VIEW_DTO } from "#@/components/game/info/GameInfoView";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import { useDisclosure } from "@mantine/hooks";

interface IGameInfoImageCarouselProps {
  gameId: number | undefined;
  imageSize: ImageSize;
  carouselProps?: CarouselProps;
}

const getCombinedImages = (game: Game) => {
  const screenshotsUrls = game.screenshots
    ?.filter((screenshot) => screenshot.url != undefined)
    .map((screenshot) => screenshot.url!);

  const artworksUrls = game.artworks
    ?.filter((screenshot) => screenshot.url != undefined)
    .map((screenshot) => screenshot.url!);

  const combinedImagesUrls = [
    ...(screenshotsUrls ?? []),
    ...(artworksUrls ?? []),
  ];

  return combinedImagesUrls;
};

const GameInfoImageCarousel = ({
  gameId,
  carouselProps,
  imageSize,
}: IGameInfoImageCarouselProps) => {
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);
  const [lightboxOpened, lightboxUtils] = useDisclosure();

  const game = gameQuery.data;

  const combinedImages = useMemo(() => {
    if (game != undefined) {
      return getCombinedImages(game);
    }
  }, [game]);

  const hasImages = combinedImages && combinedImages.length > 0;

  if (!combinedImages) {
    return null;
  }

  const buildSlides = () => {
    return combinedImages.map((url, index) => {
      const urlToUse = getSizedImageUrl(url, imageSize);
      if (!urlToUse) return null;
      return (
        <Carousel.Slide
          key={`image-${gameId}-${index}`}
          onClick={() => lightboxUtils.open()}
        >
          <Image src={urlToUse} alt={"Game Image"} />
        </Carousel.Slide>
      );
    });
  };

  return (
    <Box w={"100%"}>
      <DetailsBox
        title={"Images"}
        enabled={hasImages}
        stackProps={{
          className: "p-2",
        }}
        withDimmedTitle
        withBackground
      >
        <Carousel
          slideSize={{
            base: "100%",
            lg: "35%",
          }}
          height={"fit-content"}
          slideGap="xs"
          controlsOffset="xs"
          {...carouselProps}
        >
          {buildSlides()}
        </Carousel>
      </DetailsBox>
      <Lightbox
        open={lightboxOpened}
        close={lightboxUtils.close}
        slides={combinedImages.map((url) => {
          const urlToUse = getSizedImageUrl(url, ImageSize.FULL_HD);

          return {
            src: urlToUse!,
            alt: "Game's image",
          };
        })}
        plugins={[Zoom, Thumbnails]}
        animation={{
          zoom: 0.9,
          swipe: 0.3,
        }}
      />
    </Box>
  );
};

export { GameInfoImageCarousel };
