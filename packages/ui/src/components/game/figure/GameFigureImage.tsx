import React, { PropsWithChildren } from "react";
import { AspectRatio, Image, ImageProps } from "@mantine/core";
import { Link } from "#@/util";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";

export interface IGameFigureProps extends PropsWithChildren {
  game: TGameOrSearchGame | undefined | null;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  imageProps?: ImageProps;
  linkProps?: Omit<React.HTMLProps<HTMLAnchorElement>, "href">;
  href?: string;
  imageSize?: ImageSize;
}

/**
 * This component is the base building block for anything related to showing a game's cover.
 */
const GameFigureImage = ({
  game,
  imageProps,
  linkProps,
  href,
  onClick,
  imageSize,
  children,
}: IGameFigureProps) => {
  const coverUrl = getCoverUrl(game);
  const sizedCoverUrl = getSizedImageUrl(
    coverUrl,
    imageSize ?? ImageSize.COVER_BIG,
  );

  const defaultHref = `/game/${game?.id}`;

  return (
    <AspectRatio ratio={264 / 354} pos="relative" w={"auto"}>
      <Link
        className="w-full h-auto"
        onClick={onClick}
        {...linkProps}
        href={href ?? defaultHref}
      >
        <Image
          radius={"sm"}
          src={sizedCoverUrl ?? "/img/game_placeholder.jpeg"}
          alt={game?.name ? game.name : "Game cover"}
          className="w-full h-auto max-h-full"
          {...imageProps}
        />
      </Link>
      {children}
    </AspectRatio>
  );
};

export { GameFigureImage };
