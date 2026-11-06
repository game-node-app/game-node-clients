import { Text, Title } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { IconStarFilled } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useGame } from "#@/components/game/hooks/useGame";
import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { GameInfoImageCarousel } from "#@/components/game/info/carousel/GameInfoImageCarousel";
import { GameInfoActions } from "#@/components/game/info/GameInfoActions";
import { GameInfoDetailsDeveloperInfo } from "#@/components/game/info/GameInfoDetailsDeveloperInfo";
import { GameInfoDetailsTags } from "#@/components/game/info/GameInfoDetailsTags";
import { GameInfoExternalStores } from "#@/components/game/info/GameInfoExternalStores";
import { GameInfoPlatforms } from "#@/components/game/info/GameInfoPlatforms";
import { useReviewsScore } from "#@/components/review/hooks/useReviewsScore";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameInfoViewProps,
} from "#@/components/game/info/GameInfoView";
import { GameInfoTimeToBeat } from "#@/components/game/info/ttb/GameInfoTimeToBeat";
import { getLocalizedFirstReleaseDate } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { getGameScreenshotUrl } from "#@/components/theme/console/gameArt";
import { XboxGameScore } from "./XboxGameScore";

// store/platform logos sized for the narrow fact sheet
const FACT_ICON_PROPS = { w: 28 };
const HERO_ICON_PROPS = { w: 26 };

/**
 * Xbox store-style game page: the game's art behind a tall hero with cover, title, meta and actions,
 * a screenshot strip, then the description on the left and a fact sheet on the right. Styled in xbox/theme.css.
 */
const XboxGameInfoView = ({ id }: GameInfoViewProps) => {
  const { t, i18n } = useTranslation();
  const onMobile = useOnMobile();
  const gameQuery = useGame(id, DEFAULT_GAME_INFO_VIEW_DTO);
  const game = gameQuery.data;
  const score = useReviewsScore(id).data?.median;
  const reduceMotion = useReducedMotion();
  // pauses while hovered so a screenshot can be looked at or clicked
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnMouseEnter: true, stopOnInteraction: false }),
  );

  if (!game) {
    return <CenteredLoading />;
  }

  const art = getGameScreenshotUrl(game, ImageSize.FULL_HD);
  const releaseDate = getLocalizedFirstReleaseDate(
    game.firstReleaseDate,
    i18n.language,
  );
  const genres = game.genres
    ?.slice(0, 3)
    .map((genre) => genre.name)
    .join(" · ");

  return (
    <div className={"gn-game-view"}>
      <section className={"gn-game-hero"}>
        {art && (
          <div
            className={"gn-game-hero-art"}
            style={{ backgroundImage: `url(${art})` }}
            aria-hidden
          />
        )}
        <div className={"gn-game-hero-cover"}>
          <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
        </div>
        <div className={"gn-game-hero-info"}>
          {genres && <Text className={"gn-game-hero-genres"}>{genres}</Text>}
          <Title order={1} className={"gn-game-title"}>
            {game.name}
          </Title>
          <div className={"gn-game-hero-meta"}>
            {releaseDate && <Text>{releaseDate}</Text>}
            {score ? (
              <Text className={"gn-game-hero-score"}>
                <IconStarFilled size={14} aria-hidden />
                {score.toFixed(1)}
              </Text>
            ) : null}
            <GameInfoPlatforms
              gameId={game.id}
              className={"gn-game-hero-platforms"}
              withNotAvailableText={false}
              iconsProps={HERO_ICON_PROPS}
            />
          </div>
          <div className={"gn-game-hero-actions"}>
            <GameInfoActions game={game} />
          </div>
        </div>
      </section>

      <div className={"gn-game-media"}>
        <GameInfoImageCarousel
          gameId={game.id}
          imageSize={ImageSize.SCREENSHOT_BIG}
          carouselProps={{
            withIndicators: false,
            withControls: !onMobile,
            emblaOptions: { loop: true, align: "start" },
            plugins: reduceMotion ? [] : [autoplay.current],
          }}
        />
      </div>

      <div className={"gn-game-body"}>
        <div className={"gn-game-main"}>
          <section className={"gn-game-section"}>
            <Title order={2} className={"gn-section-title"}>
              {t("game.details.summary")}
            </Title>
            <Text className={"gn-game-summary"}>
              {game.summary ?? t("game.details.notAvailable")}
            </Text>
          </section>
          <GameInfoDetailsTags gameId={game.id} />
          <div className={"gn-game-ttb"}>
            <GameInfoTimeToBeat gameId={game.id} />
          </div>
        </div>

        <aside className={"gn-game-facts"}>
          <DetailsBox withDimmedTitle title={t("game.details.launchDate")}>
            <Text>{releaseDate ?? t("game.details.notAvailable")}</Text>
          </DetailsBox>
          <GameInfoDetailsDeveloperInfo gameId={game.id} withLogos />
          <DetailsBox withDimmedTitle title={t("game.details.whereToBuy")}>
            <GameInfoExternalStores
              gameId={game.id}
              className={"gap-3"}
              iconsProps={FACT_ICON_PROPS}
            />
          </DetailsBox>
          <XboxGameScore gameId={game.id} />
        </aside>
      </div>

    </div>
  );
};

export { XboxGameInfoView };
