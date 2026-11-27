import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import { IconArrowRight, IconStarFilled } from "@tabler/icons-react";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { cn, Link } from "#@/util";

interface FeaturedGameProps {
  game: Game;
  label: string;
  /** Spans the whole screen, so it gets a wider frame and a larger image. */
  wide?: boolean;
}

function getBackdropUrl(game: Game, size: ImageSize): string | undefined {
  const url = getSizedImageUrl(
    game.artworks?.[0]?.url ?? game.screenshots?.[0]?.url ?? game.cover?.url,
    size,
  );
  // getSizedImageUrl returns a message string when the url is not an IGDB one
  return url?.startsWith("https://") ? url : undefined;
}

/** The first game of a shelf, drawn as a card over its artwork. */
const FeaturedGame = ({ game, label, wide }: FeaturedGameProps) => {
  const { t } = useTranslation();
  const backdrop = getBackdropUrl(
    game,
    wide ? ImageSize.SCREENSHOT_HUGE : ImageSize.SCREENSHOT_BIG,
  );
  const genres = game.genres
    ?.map((genre) => genre.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
  const rating =
    typeof game.aggregatedRating === "number" && game.aggregatedRating > 0
      ? (game.aggregatedRating / 20).toFixed(1)
      : undefined;

  return (
    <Link
      href={`/game/${game.id}`}
      className={cn(
        "relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-xl bg-media-fade sm:aspect-video",
        wide ? "lg:aspect-[21/8]" : "lg:aspect-[4/3] xl:aspect-[3/2]",
      )}
    >
      {backdrop && (
        <img
          src={backdrop}
          alt={""}
          loading={"lazy"}
          draggable={false}
          className={"absolute inset-0 h-full w-full object-cover"}
        />
      )}
      <span
        className={
          "absolute left-3 top-3 z-10 inline-flex h-[22px] items-center whitespace-nowrap rounded-full bg-accent px-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-accent-contrast"
        }
      >
        {label}
      </span>
      <div
        className={
          "media-ink relative bg-media-content-scrim p-3 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-6 before:bg-gradient-to-t before:from-media-content-scrim before:to-transparent md:p-4"
        }
      >
        <div className={"flex max-w-2xl flex-col gap-1.5"}>
          <Text fw={800} size={"xl"} lineClamp={2} lh={1.15}>
            {game.name}
          </Text>
          <div className={"flex items-center gap-2 text-xs text-media-muted"}>
            {genres && <span className={"truncate"}>{genres}</span>}
            {rating && (
              <span className={"flex shrink-0 items-center gap-0.5"}>
                <IconStarFilled
                  size={12}
                  color="var(--gn-status-warning-text)"
                />
                {rating}
              </span>
            )}
          </div>
          {game.summary && (
            <Text
              size={"sm"}
              lineClamp={wide ? 2 : 3}
              className={"text-media-muted"}
            >
              {game.summary}
            </Text>
          )}
          <span
            className={
              "mt-1 inline-flex min-h-11 w-fit items-center justify-center gap-1.5 rounded-xl bg-accent px-[18px] text-[13px] font-bold text-accent-contrast"
            }
          >
            {t("home.trendingViewGame")}
            <IconArrowRight size={16} aria-hidden={true} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export { FeaturedGame };
