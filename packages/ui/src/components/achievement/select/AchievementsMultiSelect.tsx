import React from "react";
import { AchievementDto } from "@repo/wrapper/server";
import {
  Box,
  Combobox,
  ComboboxItem,
  Group,
  MultiSelect,
  MultiSelectProps,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { AchievementLogo } from "#@/components";
import { IconCheck } from "@tabler/icons-react";

interface Props extends Omit<MultiSelectProps, "data" | "renderOption"> {
  achievements: AchievementDto[];
}

const AchievementsMultiSelect = ({ achievements, ...others }: Props) => {
  const options = achievements.map(
    (achievement): ComboboxItem => ({
      label: achievement.name,
      value: achievement.id,
    }),
  );

  return (
    <MultiSelect
      data={options}
      renderOption={({ option, checked }) => {
        const relatedAchievement = achievements.find(
          (achievement) => achievement.id === option.value,
        )!;
        return (
          <Group className={`w-full h-20 flex-nowrap gap-2`}>
            <AchievementLogo achievementId={relatedAchievement.id} />
            <Stack className={"flex-grow justify-center items-start gap-2"}>
              <Title fz={"1rem"}>{relatedAchievement.name}</Title>
              <Text fz={"0.85rem"} className={"break-words"}>
                {relatedAchievement.description}
              </Text>
            </Stack>
            <Box className={"w-8 min-w-8"}>
              {checked && (
                <ThemeIcon variant={"transparent"}>
                  <IconCheck />
                </ThemeIcon>
              )}
            </Box>
          </Group>
        );
      }}
      {...others}
    ></MultiSelect>
  );
};

export { AchievementsMultiSelect };
