import React, { ExoticComponent, PropsWithoutRef } from "react";
import { IconProps } from "@tabler/icons-react";
import {
  Flex,
  FlexProps,
  Group,
  GroupProps,
  Stack,
  Text,
  TextProps,
  Title,
  TitleProps,
} from "@mantine/core";
import { RoundedIcon } from "#@/components/general/RoundedIcon";
import { cn } from "#@/util";

export interface ProfileStatsDataIconProps {
  description: string;
  count?: number;
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  iconProps?: IconProps;
  titleProps?: TitleProps;
  descriptionProps?: TextProps;
  wrapperProps?: FlexProps;
}

const ProfileStatsDataIcon = ({
  description,
  count = 0,
  iconProps,
  titleProps,
  descriptionProps,
  wrapperProps,
  icon,
}: ProfileStatsDataIconProps) => {
  return (
    <Flex
      className={cn("flex-row gap-2 flex-nowrap", wrapperProps?.className)}
      {...wrapperProps}
    >
      <RoundedIcon
        icon={icon}
        iconProps={{
          size: "3rem",
          ...iconProps,
        }}
      />
      <Stack className={"gap-0.5"}>
        <Title
          className={cn("text-brand-4 text-2xl", titleProps?.className)}
          {...titleProps}
        >
          {count}
        </Title>
        <Text
          className={cn("text-md", descriptionProps?.className)}
          {...descriptionProps}
        >
          {description}
        </Text>
      </Stack>
    </Flex>
  );
};

export { ProfileStatsDataIcon };
