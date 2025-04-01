import React, { PropsWithChildren, useMemo } from "react";
import { AspectRatio, Image, ImageProps } from "@mantine/core";
import { Link } from "#@/util";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import dayjs from "dayjs";
import { useLocalStorage } from "@mantine/hooks";

const KNACK2_COVER_URL =
  "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co4le9.jpg";

export interface IGameFigureProps extends PropsWithChildren {
  game: TGameOrSearchGame | undefined | null;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  imageProps?: ImageProps;
  linkProps?: React.HTMLProps<HTMLAnchorElement>;
  href?: string;
  imageSize?: ImageSize;
}

/**
 * This component is the base building block for anything related to showing a game's metadata.
 * It only handles logic related to image loading (skeletons, etc.).
 *
 * @param metadata
 * @param href
 * @constructor
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
  const [knackMode] = useLocalStorage({
    key: "KNACK_MODE",
    defaultValue: true,
    getInitialValueInEffect: true,
  });

  const isAprilFools = useMemo(() => dayjs().isSame("2025-04-01", "day"), []);

  const coverUrl = getCoverUrl(game);
  const sizedCoverUrl = getSizedImageUrl(
    coverUrl,
    imageSize ?? ImageSize.COVER_BIG,
  );

  const defaultHref = `/game/${game?.id}`;
  const src = isAprilFools && knackMode ? KNACK2_COVER_URL : sizedCoverUrl;

  return (
    <AspectRatio ratio={264 / 354} pos="relative" w={"auto"}>
      <Link
        href={href ?? defaultHref}
        className="w-full h-auto"
        onClick={onClick}
        {...linkProps}
      >
        <Image
          radius={"sm"}
          src={src ?? "/img/game_placeholder.jpeg"}
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
