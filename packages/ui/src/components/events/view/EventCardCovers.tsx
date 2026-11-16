import { AwardsGameCover } from "#@/components/awards/shared/AwardsGameCover";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { cn } from "#@/util";
import type { Game } from "@repo/wrapper/server";

export interface EventCardCoversProps {
  /**
   * Hydrated games, already in display order. Entries that did not resolve are
   * skipped, so a failed game read degrades to fewer covers (or none).
   */
  games: Array<Game | null | undefined>;
  max?: number;
  className?: string;
}

/**
 * Cover strip of the event cards (frame `5444:2410`): the games the card is
 * about, overlapped so four of them fit in the narrow layouts.
 */
export function EventCardCovers({
  games,
  max = 4,
  className,
}: EventCardCoversProps) {
  const visibleGames = games
    .filter((game): game is Game => game != null)
    .slice(0, max);

  if (visibleGames.length === 0) {
    return null;
  }

  return (
    <div
      data-testid={"event-card-covers"}
      className={cn("flex w-full items-end -space-x-6", className)}
    >
      {visibleGames.map((game, index) => (
        <div
          key={game.id}
          style={{ zIndex: visibleGames.length - index }}
          className={cn(
            "aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md border-2 border-paper-1 shadow-lg",
            index > 0 && "shadow-black/40",
          )}
        >
          <AwardsGameCover
            game={game}
            size={ImageSize.COVER_SMALL}
            className={"h-full"}
          />
        </div>
      ))}
    </div>
  );
}
