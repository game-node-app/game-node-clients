import React, { PropsWithChildren } from "react";
import { AspectRatio, Image, ImageProps } from "@mantine/core";
import { Link } from "#@/util";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { CollectionEntryVisibilityBadge } from "#@/components/collection/collection-entry/visibility/CollectionEntryVisibilityBadge";
import type { LibraryVisibilityLevel } from "#@/components/collection/collection-entry/visibility/LibraryVisibilityLevel";
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
  ratio?: number;
  /**
   * The viewer's own entry visibility, drawn as an owner-only badge on the
   * cover. Falls back to `game.visibility`, which listings of the viewer's own
   * library set per item.
   */
  visibility?: LibraryVisibilityLevel | null;
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
  ratio = 264 / 354,
  visibility,
  children,
}: IGameFigureImageProps) => {
  const { src: coverUrl, onError } = useGameCoverImage(
    game,
    imageSize ?? ImageSize.COVER_BIG,
  );

  const defaultHref = `/game/${game?.id}`;

  const badgeVisibility = visibility ?? game?.visibility;

  return (
    <AspectRatio ratio={ratio} pos="relative" w={"auto"}>
      <Link
        className="w-full h-auto"
        onClick={onClick}
        {...linkProps}
        href={game?.href ?? defaultHref}
      >
        <Image
          radius={"sm"}
          data-slot="game-cover"
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
      {badgeVisibility != undefined && (
        <CollectionEntryVisibilityBadge
          visibility={badgeVisibility}
          className={"absolute top-1.5 left-1.5 z-20 pointer-events-none"}
        />
      )}
      {children}
    </AspectRatio>
  );
};

export { GameFigureImage };
