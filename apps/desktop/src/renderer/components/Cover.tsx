import { AspectRatio, Image } from "@mantine/core";
import { ImageSize } from "@repo/ui/image";
import { gameCover, type OwnedGame } from "../library/model";

const PLACEHOLDER = "/img/game_placeholder.jpeg";

// Cover ratio of the GameNode design system (GameCover, 264:354).
export function Cover({
  game,
  alt = "",
  small,
  className,
}: {
  game: OwnedGame;
  alt?: string;
  small?: boolean;
  className?: string;
}) {
  const [x1, x2] = small
    ? [ImageSize.COVER_SMALL, ImageSize.COVER_SMALL_2X]
    : [ImageSize.COVER_BIG, ImageSize.COVER_BIG_2X];
  const src = gameCover(game, x1);
  return (
    <AspectRatio ratio={264 / 354} className={className}>
      <Image
        src={src}
        srcSet={src ? `${src} 1x, ${gameCover(game, x2)} 2x` : undefined}
        alt={alt}
        fit="cover"
        loading="lazy"
        fallbackSrc={PLACEHOLDER}
        className="rounded-sm"
      />
    </AspectRatio>
  );
}
