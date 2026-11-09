import React, { PropsWithChildren } from "react";
import { AspectRatio, Image, ImageProps } from "@mantine/core";
import { Link } from "#@/util";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import {
  GAME_COVER_PLACEHOLDER,
  useGameCoverImage,
} from "#@/components/game/hooks/useGameCoverImage";

export interface IGameFigureImageProps extends PropsWithChildren {
  game: TGameOrSearchGame | undefined | null;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  imageProps?: ImageProps;
  linkProps?: Omit<React.HTMLProps<HTMLAnchorElement>, "href">;
  imageSize?: ImageSize;
}

/**
 * This component is the base building block for anything related to showing a game's cover.
 */
const GameFigureImage = ({
  game,
  imageProps,
  linkProps,
  onClick,
  imageSize,
  children,
}: IGameFigureImageProps) => {
  const { src: coverUrl, onError } = useGameCoverImage(
    game,
    imageSize ?? ImageSize.COVER_BIG,
  );

  const defaultHref = `/game/${game?.id}`;

  return (
    <AspectRatio ratio={264 / 354} pos="relative" w={"auto"}>
      <Link
        className="w-full h-auto"
        onClick={onClick}
        {...linkProps}
        href={game?.href ?? defaultHref}
      >
        <Image
          radius={"sm"}
          src={coverUrl ?? GAME_COVER_PLACEHOLDER}
          alt={game?.name ? game.name : "Game cover"}
          className="w-full h-auto max-h-full"
          {...imageProps}
          onError={(event) => {
            onError();
            imageProps?.onError?.(event);
          }}
        />
      </Link>
      {children}
    </AspectRatio>
  );
};

export { GameFigureImage };
