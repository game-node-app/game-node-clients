import React, { useMemo } from "react";
import { JournalAchievementsGameGroup } from "@repo/wrapper/server";
import { EGameExternalGameCategory } from "#@/components";
import { Badge, Group } from "@mantine/core";
import { getServerStoredIcon } from "#@/util";
import { match, P } from "ts-pattern";

interface Props {
  group: JournalAchievementsGameGroup;
}

const JournalAchievementsTags = ({ group }: Props) => {
  const { isComplete, isPlatinum } = group;

  const source = group.source as unknown as EGameExternalGameCategory;

  const colorBySource = useMemo(() => {
    return (
      match(source)
        // Steam blue
        .with(EGameExternalGameCategory.Steam, () => "#1b74e4")
        // Xbox green
        .with(
          P.union(
            EGameExternalGameCategory.XboxMarketplace,
            EGameExternalGameCategory.XboxGamePassUltimateCloud,
          ),
          () => "#107c10",
        )
        // PlayStation blue
        .with(EGameExternalGameCategory.PlaystationStoreUs, () => "#003087")
        // Default gray
        .otherwise(() => "#888888")
    );
  }, [source]);

  return (
    <Group className={"flex-nowrap justify-start gap-1.5"}>
      <Badge size="sm" radius="sm" variant="light" color={colorBySource}>
        {group.sourceIcon && (
          <img
            src={getServerStoredIcon(group.sourceIcon)}
            alt={`${group.sourceName} icon`}
            className="w-4 h-4"
          />
        )}
      </Badge>
      {isComplete && (
        <Badge
          size="sm"
          radius="sm"
          variant="light"
          color="teal"
          className="font-semibold tracking-wide"
        >
          Completed
        </Badge>
      )}

      {isPlatinum && (
        <Badge
          size="sm"
          radius="sm"
          variant="gradient"
          gradient={{ from: "#0d47a1", to: "#cfd8dc", deg: 120 }}
          className="font-semibold tracking-wide text-[#0b1930]"
        >
          Platinum
        </Badge>
      )}
    </Group>
  );
};

export { JournalAchievementsTags };
