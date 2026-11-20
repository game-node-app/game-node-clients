import { CSSProperties, FocusEvent, useEffect, useState } from "react";
import { useIntersection, useReducedMotion } from "@mantine/hooks";
import {
  IconArrowRight,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconStarFilled,
} from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import { Link, RATING_STAR_COLOR } from "#@/util";
import { useGameCoverImage } from "#@/components/game/hooks/useGameCoverImage";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import classes from "./TrendingGamesHero.module.css";

/** How long each game stays featured before the next one takes over. */
export const TRENDING_HERO_ROTATE_MS = 10_000;
/** Featured game + small covers that rotate through the spotlight. */
export const TRENDING_HERO_MAX_GAMES = 5;

interface TrendingGamesHeroProps {
  games: Game[];
}

const GameCoverImg = ({ game, size }: { game: Game; size: ImageSize }) => {
  const { src, onError } = useGameCoverImage(game, size);
  return (
    <img
      src={src}
      alt={""}
      loading={"lazy"}
      draggable={false}
      onError={onError}
    />
  );
};

function getPosterUrl(game: Game, pick: number): string | undefined {
  const shots = (game.screenshots ?? []).filter((shot) => !!shot.url);
  const shot = shots.length ? shots[pick % shots.length] : undefined;
  return getValidImageUrl(
    shot?.url ?? game.artworks?.[0]?.url,
    ImageSize.SCREENSHOT_BIG,
  );
}

function getValidImageUrl(
  url: string | undefined | null,
  size: ImageSize,
): string | undefined {
  const sized = getSizedImageUrl(url ?? undefined, size);
  // getSizedImageUrl returns a message string when the url is not an IGDB one
  return sized?.startsWith("https://") ? sized : undefined;
}

/** Keyboard focus only: a mouse/touch tap on a thumbnail must not freeze the rotation. */
function isKeyboardFocus(target: EventTarget): boolean {
  try {
    return (target as Element).matches(":focus-visible");
  } catch {
    return true;
  }
}

const TrendingGamesHero = ({ games }: TrendingGamesHeroProps) => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const { ref, entry } = useIntersection<HTMLDivElement>({ threshold: 0.4 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [focused, setFocused] = useState(false);
  // explicit pause/play toggle (WCAG 2.2.2); stays until the user flips it back
  const [paused, setPaused] = useState(false);
  // Random screenshot index; stays 0 until mounted so SSR/hydration match.
  const [pick, setPick] = useState(0);

  const activeGameId = games[activeIndex % Math.max(games.length, 1)]?.id;
  useEffect(() => {
    // client-only on purpose: Math.random() during render would break SSR hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPick(Math.floor(Math.random() * 1000));
  }, [activeGameId]);

  const total = games.length;
  const game = games[activeIndex % Math.max(total, 1)];
  if (!game) return null;

  const inView = entry?.isIntersecting ?? true;
  const canRotate = total > 1 && !reducedMotion;
  const rotating = canRotate && inView && !held && !focused && !paused;

  const posterSrc =
    getPosterUrl(game, pick) ??
    getValidImageUrl(game.cover?.url, ImageSize.COVER_BIG);

  const rating =
    typeof game.aggregatedRating === "number" && game.aggregatedRating > 0
      ? (game.aggregatedRating / 20).toFixed(1)
      : undefined;
  const genres = game.genres
    ?.map((genre) => genre.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
  const year = game.firstReleaseDate
    ? new Date(game.firstReleaseDate).getFullYear()
    : undefined;
  const meta = [genres, year && !Number.isNaN(year) ? year : undefined]
    .filter(Boolean)
    .join(" · ");

  const next = () => setActiveIndex((index) => (index + 1) % total);

  // hold the rotation while keyboard focus is anywhere inside the spotlight
  const onFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (isKeyboardFocus(e.target)) setFocused(true);
  };
  const onBlurCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
  };

  return (
    <div
      ref={ref}
      className={classes.card}
      style={
        {
          "--hero-rotate-ms": `${TRENDING_HERO_ROTATE_MS}ms`,
        } as CSSProperties
      }
      // hold the rotation while the user is touching or hovering the spotlight
      onPointerDown={() => setHeld(true)}
      onPointerUp={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      <div className={classes.bg} aria-hidden={true}>
        {posterSrc && (
          <img className={classes.poster} src={posterSrc} alt={""} />
        )}
      </div>
      <div className={classes.scrim} aria-hidden={true} />

      <div className={classes.content}>
        <div className={classes.topRow}>
          <span className={`${classes.chip} ${classes.chipRank}`}>
            {t("home.trendingRank", { rank: activeIndex + 1 })}
          </span>
          {canRotate && (
            <button
              type={"button"}
              className={classes.pause}
              aria-label={t(
                paused ? "home.trendingPlay" : "home.trendingPause",
              )}
              onClick={() => setPaused((value) => !value)}
            >
              <span className={classes.pauseIcon}>
                {paused ? (
                  <IconPlayerPlayFilled size={14} />
                ) : (
                  <IconPlayerPauseFilled size={14} />
                )}
              </span>
            </button>
          )}
        </div>

        <div key={game.id} className={classes.featured}>
          {/* Decorative duplicate of the CTA below: out of the tab order and the a11y tree. */}
          <Link
            href={`/game/${game.id}`}
            className={classes.cover}
            tabIndex={-1}
            aria-hidden={true}
          >
            <GameCoverImg game={game} size={ImageSize.COVER_BIG} />
          </Link>
          <div className={classes.details}>
            <h3 className={classes.title}>{game.name}</h3>
            <div className={classes.meta}>
              {meta && <span className={classes.metaText}>{meta}</span>}
              {rating && (
                <span className={classes.rating}>
                  <IconStarFilled size={14} color={RATING_STAR_COLOR} />
                  {rating}
                </span>
              )}
            </div>
            {game.summary && <p className={classes.summary}>{game.summary}</p>}
            <Link href={`/game/${game.id}`} className={classes.cta}>
              {t("home.trendingViewGame")}
              <IconArrowRight size={16} aria-hidden={true} />
            </Link>
          </div>
        </div>

        {total > 1 && (
          <div className={classes.thumbs}>
            {games.map((item, index) => {
              const active = index === activeIndex % total;
              return (
                <button
                  key={item.id}
                  type={"button"}
                  className={`${classes.thumb} ${active ? classes.thumbActive : ""}`}
                  aria-label={t("home.trendingSelectGame", { name: item.name })}
                  aria-current={active}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className={classes.thumbCover}>
                    <GameCoverImg game={item} size={ImageSize.COVER_SMALL} />
                  </span>
                  <span className={classes.track}>
                    {active && (
                      <span
                        // new key per featured game restarts the 10s animation
                        key={`${item.id}-${activeIndex}`}
                        className={`${classes.fill} ${
                          canRotate ? "" : classes.fillStatic
                        }`}
                        style={{
                          animationPlayState: rotating ? "running" : "paused",
                        }}
                        onAnimationEnd={canRotate ? next : undefined}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export { TrendingGamesHero };
