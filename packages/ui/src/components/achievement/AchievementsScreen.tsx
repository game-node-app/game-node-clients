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
  CenteredLoading,
  DetailsBox,
  UserAvatarWithLevelInfo,
} from "../general";
import { RedeemAchievementCodeModal } from "#@/components";
import { AchievementItem } from "#@/components";
import { getPageAsOffset } from "#@/util";

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
  const achievementsQuery = useAchievements({});
  const isOwnUserId = userId != undefined && userId === targetUserId;

  const obtainedAchievements =
    obtainedAchievementsQuery.data?.slice(0, 6) ?? [];

  const pendingAchievements = useMemo(() => {
    if (
      achievementsQuery.data == undefined ||
      obtainedAchievementsQuery.data == undefined
    ) {
      return [];
    }

    const pageAsOffset = getPageAsOffset(page, DEFAULT_LIMIT);

    return achievementsQuery.data.data
      .filter(
        (achievement) =>
          !obtainedAchievementsQuery.data.some(
            (obtainedAchievement) =>
              obtainedAchievement.achievementId === achievement.id,
          ),
      )
      .slice(pageAsOffset, DEFAULT_LIMIT);
  }, [achievementsQuery.data, obtainedAchievementsQuery.data, page]);

  console.log("obtainedAchievements: ", obtainedAchievements);
  console.log("pendingAchievements: ", pendingAchievements);

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
      {achievementsQuery.isError && (
        <Center className={"mt-10"}>
          Something happened while loading achievements. Please try again.
        </Center>
      )}
      {achievementsQuery.isLoading && <CenteredLoading />}
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
