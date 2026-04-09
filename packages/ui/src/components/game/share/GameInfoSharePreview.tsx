import React from "react";
import { Divider, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameFigureImage,
  GameInfoOwnedPlatforms,
  GameInfoSharePlaytime,
  GameNodeLogo,
  GameRating,
  ImageSize,
  ShareFormValues,
  useGame,
  UserAvatarGroup,
  useReviewForUserIdAndGameId,
  useUserId,
} from "#@/components";
import { UseFormWatch } from "react-hook-form";
import { useTranslation } from "@repo/locales";

interface SharePreviewProps {
  ref: React.RefObject<HTMLDivElement | null>;
  gameId: number;
  watchFormValues: UseFormWatch<ShareFormValues>;
}

export const GAME_INFO_SHARE_PREVIEW_ID = "game-info-preview-id";

const GameInfoSharePreview = ({
  ref,
  gameId,
  watchFormValues,
}: SharePreviewProps) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);
  const game = gameQuery.data;
  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);
  const rating = reviewQuery.data?.rating ?? 0;
  const { transparentBackground, withRating, withOwnedPlatforms, withDivider } =
    watchFormValues();

  return (
    <Paper
      id={GAME_INFO_SHARE_PREVIEW_ID}
      ref={ref}
      w={"100%"}
      styles={{
        root: {
          backgroundColor: transparentBackground
            ? "rgba(255,255,255,0)"
            : "#1A1A1A",
        },
      }}
    >
      <Stack w={"100%"} align={"center"}>
        <Stack align={"center"} className={"w-full p-10 pb-2"}>
          <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
          <Title size={"h4"} className={"text-center mt-4"}>
            {game?.name}
          </Title>
          {withRating && <GameRating value={rating} />}
        </Stack>
        <Group className={"w-full justify-center flex-nowrap gap-16"}>
          <div className={"w-20"}></div>
          <GameInfoSharePlaytime gameId={gameId} />
        </Group>
        {withDivider && <Divider w={"100%"} />}
        {withOwnedPlatforms && (
          <Stack align={"center"} className={"w-full"}>
            <Text>{t("game.labels.playedIn")}</Text>
            <GameInfoOwnedPlatforms
              gameId={gameId}
              iconsProps={{
                w: 36,
              }}
              justify={"center"}
            />
          </Stack>
        )}

        <Flex justify={"space-between"} className={"w-full px-4 py-2"}>
          <UserAvatarGroup userId={userId!} />
          <GameNodeLogo className={"w-20 h-auto"} />
        </Flex>
      </Stack>
    </Paper>
  );
};

export { GameInfoSharePreview };
