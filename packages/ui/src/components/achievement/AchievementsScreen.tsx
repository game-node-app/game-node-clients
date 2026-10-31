import { AchievementItem, RedeemAchievementCodeModal } from "#@/components";
import {
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Pagination,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { AchievementProgressDto, AchievementV2Dto } from "@repo/wrapper/server";
import { useMemo, useState } from "react";
import { useUserId } from "../auth";
import {
  CenteredErrorMessage,
  CenteredLoading,
  DetailsBox,
  UserAvatarWithLevelInfo,
} from "../general";
import { useAchievementProgress, useAchievementsV2 } from "./hooks";

interface Props {
  targetUserId: string;
  withUserLevel?: boolean;
}

const DEFAULT_LIMIT = 12;

const AchievementSection = ({
  title,
  items,
  progressById,
}: {
  title: string;
  items: AchievementV2Dto[];
  progressById: Map<string, AchievementProgressDto>;
}) => {
  const [page, setPage] = useState(1);
  if (items.length === 0) return null;
  const visible = items.slice((page - 1) * DEFAULT_LIMIT, page * DEFAULT_LIMIT);
  return (
    <DetailsBox title={title}>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        {visible.map((achievement) => (
          <AchievementItem
            key={achievement.id}
            achievement={achievement}
            progress={progressById.get(achievement.id)}
          />
        ))}
      </SimpleGrid>
      {items.length > DEFAULT_LIMIT && (
        <Center mt={"1rem"}>
          <Pagination
            value={page}
            total={Math.ceil(items.length / DEFAULT_LIMIT)}
            onChange={setPage}
          />
        </Center>
      )}
    </DetailsBox>
  );
};

const AchievementsScreen = ({ targetUserId, withUserLevel = true }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const achievementsQuery = useAchievementsV2(targetUserId);
  const progressQuery = useAchievementProgress(targetUserId);
  const [now] = useState(Date.now);
  const [redeemCodeModalOpened, redeemCodeModalUtils] = useDisclosure();

  const isOwnUserId = userId != undefined && userId === targetUserId;

  const { progressById, obtained, notObtained, activeEvents, pastEvents } =
    useMemo(() => {
      const progressById = new Map(
        (progressQuery.data ?? []).map((p) => [p.achievementId, p]),
      );
      const obtained: AchievementV2Dto[] = [];
      const notObtained: AchievementV2Dto[] = [];
      const active = new Map<string, AchievementV2Dto[]>();
      const past = new Map<string, AchievementV2Dto[]>();
      const names = new Map<string, string>();

      for (const achievement of achievementsQuery.data ?? []) {
        const event = achievement.event;
        if (event) {
          // Upcoming events are not shown.
          const group =
            Date.parse(event.endsAt) <= now
              ? past
              : Date.parse(event.startsAt) <= now
                ? active
                : null;
          if (group) {
            names.set(
              event.id,
              group === active
                ? `${event.name} (${t("achievements.labels.eventEnds", { date: new Date(event.endsAt).toLocaleDateString() })})`
                : event.name,
            );
            group.set(event.id, [...(group.get(event.id) ?? []), achievement]);
          }
        } else if ((progressById.get(achievement.id)?.tier ?? 0) > 0) {
          obtained.push(achievement);
        } else {
          notObtained.push(achievement);
        }
      }
      const toSections = (group: Map<string, AchievementV2Dto[]>) =>
        [...group].map(([id, items]) => ({ id, title: names.get(id)!, items }));
      return {
        progressById,
        obtained,
        notObtained,
        activeEvents: toSections(active),
        pastEvents: toSections(past),
      };
    }, [achievementsQuery.data, progressQuery.data, now, t]);

  if (!targetUserId) return null;

  const isLoading = achievementsQuery.isLoading || progressQuery.isLoading;
  const error = achievementsQuery.error || progressQuery.error;

  return (
    <Stack w={"100%"}>
      <Group
        className={
          "justify-center flex-wrap lg:flex-nowrap lg:justify-between lg:mx-4"
        }
      >
        <Flex
          className={
            withUserLevel
              ? "w-full justify-center lg:justify-start lg:w-8/12"
              : "hidden"
          }
        >
          <UserAvatarWithLevelInfo userId={targetUserId} />
        </Flex>

        {isOwnUserId && (
          <Group className={"grow justify-center lg:justify-end"}>
            <RedeemAchievementCodeModal
              opened={redeemCodeModalOpened}
              onClose={redeemCodeModalUtils.close}
            />
            <Button onClick={redeemCodeModalUtils.open}>
              {t("achievements.buttons.redeemCode")}
            </Button>
          </Group>
        )}
      </Group>

      {withUserLevel && <Divider className={"w-full"} />}
      {error && <CenteredErrorMessage error={error} />}
      {isLoading && <CenteredLoading />}
      {activeEvents.map((section) => (
        <AchievementSection
          key={section.id}
          title={section.title}
          items={section.items}
          progressById={progressById}
        />
      ))}
      <AchievementSection
        title={t("achievements.sections.obtained")}
        items={obtained}
        progressById={progressById}
      />
      <AchievementSection
        title={t("achievements.sections.notObtained")}
        items={notObtained}
        progressById={progressById}
      />
      {pastEvents.map((section) => (
        <AchievementSection
          key={section.id}
          title={`${t("achievements.sections.pastEvents")}: ${section.title}`}
          items={section.items}
          progressById={progressById}
        />
      ))}
    </Stack>
  );
};

export { AchievementsScreen };