import { Text, Title } from "@mantine/core";
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
import { GameInfoScore } from "#@/components/game/info/GameInfoScore";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameInfoViewProps,
} from "#@/components/game/info/GameInfoView";
import { GameInfoTimeToBeat } from "#@/components/game/info/ttb/GameInfoTimeToBeat";
import { getLocalizedFirstReleaseDate } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { getGameArtUrl } from "#@/components/theme/console/gameArt";

/**
 * Xbox store-style game page: the game's art behind a hero with cover, title and actions,
 * then the description on the left and a fact sheet on the right. Styled in xbox/theme.css.
 */
const XboxGameInfoView = ({ id }: GameInfoViewProps) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const gameQuery = useGame(id, DEFAULT_GAME_INFO_VIEW_DTO);
  const game = gameQuery.data;

  if (!game) {
    return <CenteredLoading />;
  }

  const art = getGameArtUrl(game, ImageSize.FULL_HD);
  const releaseDate = getLocalizedFirstReleaseDate(game.firstReleaseDate);

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
          <Title order={1} className={"gn-game-title"}>
            {game.name}
          </Title>
          {releaseDate && (
            <Text className={"gn-game-hero-meta"}>{releaseDate}</Text>
          )}
          <div className={"gn-game-hero-actions"}>
            <GameInfoActions game={game} />
          </div>
        </div>
      </section>

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
          <GameInfoTimeToBeat gameId={game.id} />
        </div>

        <aside className={"gn-game-facts"}>
          <DetailsBox withDimmedTitle title={t("game.details.launchDate")}>
            <Text>{releaseDate ?? t("game.details.notAvailable")}</Text>
          </DetailsBox>
          <GameInfoDetailsDeveloperInfo gameId={game.id} />
          <DetailsBox withDimmedTitle title={t("game.details.whereToPlay")}>
            <GameInfoPlatforms gameId={game.id} className={"gap-3"} />
          </DetailsBox>
          <DetailsBox withDimmedTitle title={t("game.details.whereToBuy")}>
            <GameInfoExternalStores gameId={game.id} className={"gap-3"} />
          </DetailsBox>
          <GameInfoScore gameId={game.id} />
        </aside>
      </div>

      <GameInfoImageCarousel
        gameId={game.id}
        imageSize={ImageSize.SCREENSHOT_BIG}
        carouselProps={{
          withIndicators: !onMobile,
          withControls: !onMobile,
        }}
      />
    </div>
  );
};

export { XboxGameInfoView };
