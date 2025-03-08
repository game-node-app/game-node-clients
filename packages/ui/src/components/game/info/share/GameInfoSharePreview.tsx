import React from "react";
import { Divider, Flex, Paper, Stack, Text, Title } from "@mantine/core";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameFigureImage,
  GameInfoOwnedPlatforms,
  GameNodeLogo,
  GameRating,
  ImageSize,
  ShareFormValues,
  useGame,
  useReviewForUserIdAndGameId,
  useUserId,
} from "#@/components";
import { UseFormWatch } from "react-hook-form";

interface SharePreviewProps {
  gameId: number;
  watchFormValues: UseFormWatch<ShareFormValues>;
}

export const GAME_INFO_SHARE_PREVIEW_ID = "game-info-preview-id";

const GameInfoSharePreview = ({
  gameId,
  watchFormValues,
}: SharePreviewProps) => {
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
        {withDivider && <Divider w={"100%"} />}
        {withOwnedPlatforms && (
          <Stack align={"center"} className={"w-full"}>
            <Text>Played in</Text>
            <GameInfoOwnedPlatforms
              gameId={gameId}
              iconsProps={{
                w: 36,
              }}
              justify={"center"}
            />
          </Stack>
        )}
        <Flex justify={"center"} className={"mt-16 mb-8"}>
          <GameNodeLogo className={"w-20 h-auto"} />
        </Flex>
      </Stack>
    </Paper>
  );
};

export default GameInfoSharePreview;
