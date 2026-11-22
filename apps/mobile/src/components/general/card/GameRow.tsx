import { cn, GameFigureImage, Link } from "@repo/ui";
import { IconChevronRight } from "@tabler/icons-react";
import type { ComponentProps, ReactNode } from "react";

interface Props {
  /** Game whose cover is shown (links to the game page). */
  game: ComponentProps<typeof GameFigureImage>["game"];
  title: ReactNode;
  /** Small muted line under the title (e.g. a rating or a date). */
  meta?: ReactNode;
  /** Chips row (platform, status...). */
  chips?: ReactNode;
  /** Content before the cover (e.g. the day of the month). */
  leading?: ReactNode;
  /** Replaces the chevron with custom controls. */
  trailing?: ReactNode;
  /** Destination of the text area. Not tab-aware: `Link` resolves it. */
  href?: string;
  className?: string;
}

/**
 * Compact game row shared by the journal and the reviews list: cover, title, meta line, optional
 * chips and a neutral chevron. Meant to sit inside a `CardSection`, which draws the card; dividers
 * between sibling rows come from the `gn-row` class (see `.gn-card` in globals.css). The cover and
 * the text area are separate links so there are no nested anchors.
 */
const GameRow = ({
  game,
  title,
  meta,
  chips,
  leading,
  trailing,
  href,
  className,
}: Props) => {
  const body = (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="m-0 line-clamp-2 text-[15px] font-semibold leading-5 text-foreground [overflow-wrap:anywhere]">
        {title}
      </p>
      {meta != undefined && (
        <div className="text-[13px] leading-4 text-dimmed-1">{meta}</div>
      )}
      {chips != undefined && (
        <div className="flex flex-wrap gap-1.5">{chips}</div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "gn-row flex w-full items-center gap-3 px-3 py-3",
        className,
      )}
    >
      {leading != undefined && (
        <span className="w-5 shrink-0 text-center text-base font-bold text-dimmed-1">
          {leading}
        </span>
      )}
      <div className="w-12 shrink-0">
        <GameFigureImage game={game} />
      </div>
      {href != undefined ? (
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-2">
          {body}
          {trailing == undefined && (
            <IconChevronRight size={18} className="shrink-0 text-dimmed-1" />
          )}
        </Link>
      ) : (
        body
      )}
      {trailing}
    </div>
  );
};

export { GameRow };
