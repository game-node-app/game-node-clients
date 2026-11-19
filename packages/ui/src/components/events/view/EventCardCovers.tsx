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
  /** Spreads the covers across the full width, side by side (mobile card). */
  stretch?: boolean;
  className?: string;
}

/**
 * Cover strip of the event cards (frame `5444:2410`): the games the card is
 * about, overlapped so four of them fit in the narrow layouts.
 */
export function EventCardCovers({
  games,
  max = 4,
  stretch = false,
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
      style={
        stretch
          ? { gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }
          : undefined
      }
      className={cn(
        stretch ? "grid w-full gap-2" : "flex w-full items-end -space-x-6",
        className,
      )}
    >
      {visibleGames.map((game, index) => (
        <div
          key={game.id}
          style={{ zIndex: visibleGames.length - index }}
          className={cn(
            "aspect-[3/4] overflow-hidden rounded-md border-2 border-paper-1 shadow-lg",
            stretch ? "w-full" : "w-16 shrink-0",
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
