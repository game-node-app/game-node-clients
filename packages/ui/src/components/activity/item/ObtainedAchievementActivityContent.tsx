import {
  GameAchievementHoverIcon,
  TextLink,
  useGame,
  useObtainedGameAchievementActivity,
  useOnMobile,
} from "#@/components";
import {
  Center,
  HoverCard,
  Loader,
  Popover,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  GameAchievementWithObtainedInfo,
  GameObtainedAchievementActivityDto,
  ObtainedGameAchievementActivity,
} from "@repo/wrapper/server";
import { useMemo, useState } from "react";

type ObtainedAchievementActivitySummary =
  | GameObtainedAchievementActivityDto
  | ObtainedGameAchievementActivity;

interface Props {
  activity: ObtainedAchievementActivitySummary | undefined;
  /** True when the parent already embedded `activity.game` (including `null`). */
  hasEmbeddedGame?: boolean;
}

function hasDetailedAchievements(
  activity: ObtainedAchievementActivitySummary | undefined,
  hasEmbeddedGame: boolean,
): activity is GameObtainedAchievementActivityDto {
  if (!activity || !Array.isArray(activity.obtainedGameAchievements)) {
    return false;
  }
  if (activity.obtainedGameAchievements.length === 0) {
    return !hasEmbeddedGame && !("profile" in activity);
  }
  return "externalId" in activity.obtainedGameAchievements[0];
}

const ObtainedAchievementActivityContent = ({
  activity,
  hasEmbeddedGame = false,
}: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const [hasOpened, setHasOpened] = useState(false);

  const PopoverElement = onMobile ? Popover : HoverCard;

  const gameId = activity?.externalGame?.gameId;

  useGame(
    gameId,
    {
      relations: {
        cover: true,
      },
    },
    "off",
    { enabled: !hasEmbeddedGame },
  );

  const hasDetails = hasDetailedAchievements(activity, hasEmbeddedGame);
  const detailedActivityQuery = useObtainedGameAchievementActivity(
    activity?.id,
    {
      enabled: hasOpened && !hasDetails,
    },
  );

  const obtainedGameAchievements: GameAchievementWithObtainedInfo[] = useMemo(
    () =>
      hasDetails
        ? activity.obtainedGameAchievements
        : (detailedActivityQuery.data?.obtainedGameAchievements ?? []),
    [
      activity,
      detailedActivityQuery.data?.obtainedGameAchievements,
      hasDetails,
    ],
  );

  const renderedText = useMemo(() => {
    if (activity == undefined) return "";

    const totalObtained = activity.totalObtained || 0;
    const hasCompleted = activity.hasCompletedAllAchievements || false;
    const hasPlatinum = activity.hasObtainedPlatinumTrophy || false;

    if (hasCompleted && hasPlatinum) {
      return t("activity.items.obtainedAllAndPlatinum");
    } else if (hasCompleted) {
      return t("activity.items.completedAllAchievements");
    } else if (hasPlatinum) {
      return t("activity.items.obtainedPlatinum");
    } else {
      return t("activity.items.obtainedAchievements", {
        count: totalObtained,
        suffix: totalObtained > 1 ? "s" : "",
      });
    }
  }, [activity, t]);

  if (!activity) {
    return <></>;
  }

  return (
    <PopoverElement withArrow onOpen={() => setHasOpened(true)}>
      <PopoverElement.Target>
        <Text span className={"text-xs font-bold"}>
          {renderedText}
        </Text>
      </PopoverElement.Target>
      <PopoverElement.Dropdown className={"max-w-[95vw] md:max-w-sm"}>
        <Stack>
          {!hasDetails && detailedActivityQuery.isLoading ? (
            <Center>
              <Loader size={"sm"} />
            </Center>
          ) : (
            <SimpleGrid className={"w-full gap-1 gap-y-2"} cols={6}>
              {obtainedGameAchievements.map((obtainedAchievement) => (
                <GameAchievementHoverIcon
                  key={obtainedAchievement.externalId}
                  achievement={obtainedAchievement}
                />
              ))}
            </SimpleGrid>
          )}
          <TextLink
            href={`/profile/${activity.profileUserId}?tab=achievements`}
            className={"mt-2"}
          >
            {t("actions.seeMore")}
          </TextLink>
        </Stack>
      </PopoverElement.Dropdown>
    </PopoverElement>
  );
};

export { ObtainedAchievementActivityContent };
