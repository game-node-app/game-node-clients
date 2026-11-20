import { Title, Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useReducedMotion } from "@mantine/hooks";
import { IconStarFilled } from "@tabler/icons-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useTranslation } from "@repo/locales";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useGame } from "#@/components/game/hooks/useGame";
import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { GameInfoActions } from "#@/components/game/info/GameInfoActions";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  type GameInfoViewProps,
} from "#@/components/game/info/GameInfoView";
import { GameInfoDetailsDeveloperInfo } from "#@/components/game/info/GameInfoDetailsDeveloperInfo";
import { GameInfoDetailsTags } from "#@/components/game/info/GameInfoDetailsTags";
import { GameInfoExternalStores } from "#@/components/game/info/GameInfoExternalStores";
import { GameInfoPlatforms } from "#@/components/game/info/GameInfoPlatforms";
import { GameInfoTimeToBeat } from "#@/components/game/info/ttb/GameInfoTimeToBeat";
import { getLocalizedFirstReleaseDate } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { useReviewsScore } from "#@/components/review/hooks/useReviewsScore";
import { getGameArtUrl } from "#@/theme/experiences/console/gameArt";
import { XboxGameScore } from "./XboxGameScore";
import classes from "./XboxGameInfoView.module.css";

// store/platform logos sized for the narrow fact sheet
const FACT_ICON_PROPS = { w: 28 };
const HERO_ICON_PROPS = { w: 26 };

/**
 * Xbox store-style game page: the game's art (or its cover) behind a tall hero
 * with cover, title, meta and the shared library actions, a screenshot strip,
 * then the description on the left and the fact sheet on the right.
 *
 * It reads through `DEFAULT_GAME_INFO_VIEW_DTO` so the web game page's SSR
 * prefetch hydrates this screen too. Screenshot URLs are derived from the
 * already loaded game, so the strip adds no query.
 */
const XboxGameInfoView = ({ id }: GameInfoViewProps) => {
  const { t, i18n } = useTranslation();
  const onMobile = useOnMobile();
  const gameQuery = useGame(id, DEFAULT_GAME_INFO_VIEW_DTO);
  const game = gameQuery.data;
  const score = useReviewsScore(id).data?.median;
  const reduceMotion = useReducedMotion();
  // pauses while hovered so a screenshot can be looked at
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnMouseEnter: true, stopOnInteraction: false }),
  );

  if (!game) {
    return <CenteredLoading />;
  }

  const backdrop =
    getGameArtUrl(game, ImageSize.FULL_HD) ??
    getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG_2X);

  const screenshots = (game.screenshots ?? []).flatMap((screenshot) => {
    const url = getSizedImageUrl(screenshot.url, ImageSize.SCREENSHOT_BIG);
    return url ? [url] : [];
  });

  const releaseDate = getLocalizedFirstReleaseDate(
    game.firstReleaseDate,
    i18n.language,
  );
  const genres = game.genres
    ?.slice(0, 3)
    .map((genre) => genre.name)
    .join(" · ");

  const stripPlugins = reduceMotion ? [] : [autoplay.current];

  return (
    <article className={classes.view} data-xbox-game-view>
      <section
        className={classes.hero}
        data-has-art={backdrop ? "true" : "false"}
      >
        {backdrop && (
          <div
            className={classes.heroArt}
            style={{ backgroundImage: `url(${backdrop})` }}
            data-xbox-game-art
            aria-hidden
          />
        )}
        <div className={classes.heroCover}>
          <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
        </div>
        <div className={classes.heroInfo}>
          {genres && <Text className={classes.heroGenres}>{genres}</Text>}
          <Title order={1} className={classes.title}>
            {game.name}
          </Title>
          <div className={classes.heroMeta}>
            {releaseDate && <Text>{releaseDate}</Text>}
            {score ? (
              <Text className={classes.heroScore}>
                <IconStarFilled size={14} aria-hidden />
                {score.toFixed(1)}
              </Text>
            ) : null}
            <GameInfoPlatforms
              gameId={game.id}
              className={classes.heroPlatforms}
              withNotAvailableText={false}
              iconsProps={HERO_ICON_PROPS}
            />
          </div>
          <div className={classes.heroActions}>
            <GameInfoActions game={game} />
          </div>
        </div>
      </section>

      {screenshots.length > 0 && (
        <section
          className={classes.media}
          data-xbox-game-media
          data-autoplay={reduceMotion ? "off" : "on"}
          data-plugins={stripPlugins.length}
        >
          <Carousel
            slideSize={{ base: "100%", lg: "35%" }}
            slideGap={"xs"}
            withIndicators={false}
            withControls={!onMobile}
            emblaOptions={{ loop: true, align: "start" }}
            plugins={stripPlugins}
          >
            {screenshots.map((url, index) => (
              <Carousel.Slide key={`${game.id}-${index}`}>
                <img
                  className={classes.mediaImage}
                  src={url}
                  alt={game.name}
                  loading={"lazy"}
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        </section>
      )}

      <div className={classes.body}>
        <div className={classes.main}>
          <section className={classes.section}>
            <Title order={2} className={classes.sectionTitle}>
              {t("game.details.summary")}
            </Title>
            <Text className={classes.summary}>
              {game.summary ?? t("game.details.notAvailable")}
            </Text>
          </section>
          <GameInfoDetailsTags gameId={game.id} />
          <GameInfoTimeToBeat gameId={game.id} />
        </div>

        <aside className={classes.facts}>
          <DetailsBox withDimmedTitle title={t("game.details.launchDate")}>
            <Text>{releaseDate ?? t("game.details.notAvailable")}</Text>
          </DetailsBox>
          <GameInfoDetailsDeveloperInfo gameId={game.id} />
          <DetailsBox withDimmedTitle title={t("game.details.whereToBuy")}>
            <GameInfoExternalStores
              gameId={game.id}
              className={classes.storeIcons}
              iconsProps={FACT_ICON_PROPS}
            />
          </DetailsBox>
          <XboxGameScore gameId={game.id} />
        </aside>
      </div>
    </article>
  );
};

export { XboxGameInfoView };
