import {
  GAME_COVER_PLACEHOLDER,
  useGameCoverImage,
} from "#@/components/game/hooks/useGameCoverImage";
import type { TGameOrSearchGame } from "#@/components/game/util/types";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { cn } from "#@/util";
import { Image, type ImageProps } from "@mantine/core";

export interface AwardsGameCoverProps {
  game?: TGameOrSearchGame | null;
  size?: ImageSize;
  className?: string;
  imageProps?: Omit<ImageProps, "src" | "alt" | "onError">;
}

/**
 * Cover image without a nested link, so it can live inside clickable cards and
 * rows. Uses the shared cover resolution (default covers and placeholders).
 */
const AwardsGameCover = ({
  game,
  size = ImageSize.COVER_SMALL,
  className,
  imageProps,
}: AwardsGameCoverProps) => {
  const { src, onError } = useGameCoverImage(game, size);

  return (
    <Image
      data-awards-game-cover
      src={src ?? GAME_COVER_PLACEHOLDER}
      alt={game?.name ?? ""}
      onError={onError}
      radius={"sm"}
      className={cn("w-full object-cover", className)}
      {...imageProps}
    />
  );
};

export { AwardsGameCover };
