import React, { useState } from "react";
import {
  Box,
  Button,
  Center,
  Divider,
  Group,
  Pagination,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useDisclosure } from "@mantine/hooks";
import { useUserId } from "../auth";
import { useAchievements } from "./hooks";
import { CenteredLoading, UserAvatarWithLevelInfo } from "../general";
import { RedeemAchievementCodeModal } from "#@/components";
import { AchievementItem } from "#@/components";

interface Props {
  targetUserId: string;
  withUserLevel?: boolean;
}

const AchievementsScreen = ({ targetUserId, withUserLevel = true }: Props) => {
  const userId = useUserId();
  const [paginationData, setPaginationData] = useState({
    offset: 0,
    limit: 8,
  });
  const achievements = useAchievements(paginationData);
  const isOwnUserId = userId != undefined && userId === targetUserId;

  const [redeemCodeModalOpened, redeemCodeModalUtils] = useDisclosure();

  if (!targetUserId) return null;

  return (
    <Stack w={"100%"}>
      <Group
        wrap={"nowrap"}
        className={"justify-center lg:justify-between lg:mx-4"}
      >
        <Box className={withUserLevel ? "w-5/12 lg:w-8/12" : "hidden"}>
          <UserAvatarWithLevelInfo userId={targetUserId} />
        </Box>

        {isOwnUserId && (
          <Group className={"grow justify-end"}>
            <RedeemAchievementCodeModal
              opened={redeemCodeModalOpened}
              onClose={redeemCodeModalUtils.close}
            />
            <Button className={""} onClick={redeemCodeModalUtils.open}>
              Redeem a code
            </Button>
          </Group>
        )}
      </Group>

      {withUserLevel && <Divider className={"w-full"} />}
      {achievements.isError && (
        <Center className={"mt-10"}>
          Something happened while loading achievements. Please try again.
        </Center>
      )}
      {achievements.isLoading && <CenteredLoading />}
      <SimpleGrid
        cols={{
          base: 1,
          lg: 2,
        }}
      >
        {achievements.data?.data?.map((achievement) => {
          return (
            <AchievementItem
              key={achievement.id}
              targetUserId={targetUserId}
              achievement={achievement}
            />
          );
        })}
      </SimpleGrid>
      <Center mt={"1rem"}>
        <Pagination
          total={achievements.data?.pagination?.totalPages || 1}
          onChange={(page) => {
            const pageAsOffset = paginationData.limit * (page - 1);
            setPaginationData({
              offset: pageAsOffset,
              limit: paginationData.limit,
            });
          }}
        />
      </Center>
    </Stack>
  );
};

export { AchievementsScreen };
