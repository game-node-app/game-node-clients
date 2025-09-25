import React from "react";
import { VotableAwardsCategoryDto } from "@repo/wrapper/server";
import { ActionIcon, Box, Group, Stack, Text } from "@mantine/core";
import {
  AwardsCategoryGameFigure,
  CenteredLoading,
  GameFigureImage,
  useGame,
  useUserId,
} from "#@/components";
import { useAwardCategoryVote } from "#@/components/awards/hooks/useAwardCategoryVote.ts";
import { IconEditCircle, IconStarFilled } from "@tabler/icons-react";
import { AwardsVoteSubmitFormModal } from "#@/components/awards/form/AwardsVoteSubmitFormModal.tsx";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

export interface AwardsEventCategoryProps {
  userId: string;
  category: VotableAwardsCategoryDto;
}

const AwardsEventCategory = ({
  userId,
  category,
}: AwardsEventCategoryProps) => {
  const ownUserId = useUserId();

  const { data: vote, isLoading } = useAwardCategoryVote(userId, category.id);

  const [voteModalOpened, voteModalUtils] = useDisclosure();

  const { data: game } = useGame(vote?.gameId, {
    relations: {
      cover: true,
    },
  });

  const isOwnVote = ownUserId === userId;
  const isVotingEnabled = isOwnVote && category.isVotable;

  if (isLoading) {
    return <CenteredLoading />;
  }

  return (
    <Box className={"w-full bg-[#212121] text-white p-2 lg:p-4 rounded-sm"}>
      <AwardsVoteSubmitFormModal
        category={category}
        opened={voteModalOpened}
        onClose={voteModalUtils.close}
      />
      <Stack className={"w-full items-center"}>
        <Group className={"gap-1 justify-center"}>
          <Text className={"text-center text-sm"}>{category.name}</Text>
          {(category.isPersonalGOTY || category.isGOTY) && (
            <IconStarFilled size={16} />
          )}
        </Group>
        <AwardsCategoryGameFigure
          game={game}
          onEditClick={() => {
            if (!isVotingEnabled) {
              return;
            }

            voteModalUtils.open();
          }}
        />
        {game && <Text className={"text-center text-sm"}>{game.name}</Text>}
      </Stack>
    </Box>
  );
};

export { AwardsEventCategory };
