import { GameAchievementHoverIcon } from "#@/components";
import { SimpleGrid, Spoiler } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { GameAchievementWithObtainedInfo } from "@repo/wrapper/server";
import { useState } from "react";

interface Props {
  achievements: GameAchievementWithObtainedInfo[];
}

/**
 * Widest grid below has 18 columns. While collapsed, the spoiler only shows the
 * first row, so mounting one extra icon is enough to overflow into a second row
 * (which makes the spoiler render its "show more" control) without mounting
 * hundreds of hover cards nobody can see.
 */
const COLLAPSED_ICON_COUNT = 19;

const JournalAchievementsIconsList = ({ achievements }: Props) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const visibleAchievements = expanded
    ? achievements
    : achievements.slice(0, COLLAPSED_ICON_COUNT);

  return (
    <Spoiler
      maxHeight={56}
      expanded={expanded}
      onExpandedChange={setExpanded}
      hideLabel={t("actions.showLess")}
      showLabel={t("actions.showMore")}
      transitionDuration={200}
      classNames={{ control: "mt-2", root: "w-full @container" }}
    >
      <SimpleGrid
        className={
          "gap-1 gap-y-3 w-full grid-cols-6 @xs:grid-cols-8 @sm:grid-cols-12 @md:grid-cols-[repeat(15,minmax(0,1fr))] @lg:grid-cols-[repeat(18,minmax(0,1fr))]"
        }
      >
        {visibleAchievements.map((achievement) => (
          <GameAchievementHoverIcon
            key={achievement.externalId}
            achievement={achievement}
          />
        ))}
      </SimpleGrid>
    </Spoiler>
  );
};

export { JournalAchievementsIconsList };
