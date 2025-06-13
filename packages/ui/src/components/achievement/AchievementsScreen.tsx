import React, { useMemo, useState } from "react";
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
import { useAchievements, useAllObtainedAchievements } from "./hooks";
import {
  CenteredErrorMessage,
  CenteredLoading,
  DetailsBox,
  UserAvatarWithLevelInfo,
} from "../general";
import { RedeemAchievementCodeModal } from "#@/components";
import { AchievementItem } from "#@/components";
import { getPageAsOffset } from "#@/util";
import { useNonObtainedAchievements } from "#@/components/achievement/hooks/useNonObtainedAchievements.ts";

interface Props {
  targetUserId: string;
  withUserLevel?: boolean;
}

const DEFAULT_LIMIT = 12;

const AchievementsScreen = ({ targetUserId, withUserLevel = true }: Props) => {
  const userId = useUserId();
  const [page, setPage] = useState(1);

  const obtainedAchievementsQuery = useAllObtainedAchievements(
    targetUserId,
    true,
  );
  const isOwnUserId = userId != undefined && userId === targetUserId;

  const obtainedAchievements =
    obtainedAchievementsQuery.data?.slice(0, 6) ?? [];

  const nonObtainedAchievementsQuery = useNonObtainedAchievements(targetUserId);

  const pendingAchievements = useMemo(() => {
    if (nonObtainedAchievementsQuery.data == undefined) {
      return [];
    }

    const pageAsOffset = getPageAsOffset(page, DEFAULT_LIMIT);

    return nonObtainedAchievementsQuery.data.slice(pageAsOffset, DEFAULT_LIMIT);
  }, [nonObtainedAchievementsQuery.data, page]);

  const [redeemCodeModalOpened, redeemCodeModalUtils] = useDisclosure();

  const isLoading =
    obtainedAchievementsQuery.isLoading ||
    nonObtainedAchievementsQuery.isLoading;
  const isError =
    obtainedAchievementsQuery.isError || nonObtainedAchievementsQuery.isError;
  const error =
    obtainedAchievementsQuery.error || nonObtainedAchievementsQuery.error;

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
      {isError && <CenteredErrorMessage error={error ?? undefined} />}
      {isLoading && <CenteredLoading />}
      <DetailsBox title={""}>
        <SimpleGrid
          cols={{
            base: 1,
            lg: 2,
          }}
        >
          {obtainedAchievements.map((obtainedAchievement) => {
            return (
              <AchievementItem
                key={obtainedAchievement.id}
                targetUserId={targetUserId}
                achievement={obtainedAchievement.achievement}
              />
            );
          })}
        </SimpleGrid>
      </DetailsBox>
      <DetailsBox title={"Not yet obtained"}>
        <SimpleGrid
          cols={{
            base: 1,
            lg: 2,
          }}
        >
          {pendingAchievements.map((achievement) => {
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
            value={page}
            total={Math.ceil(pendingAchievements.length / DEFAULT_LIMIT)}
            onChange={(page) => {
              setPage(page);
            }}
          />
        </Center>
      </DetailsBox>
    </Stack>
  );
};

export { AchievementsScreen };
