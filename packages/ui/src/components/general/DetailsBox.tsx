import React, { PropsWithChildren } from "react";
import { Group, Stack, StackProps, Text } from "@mantine/core";
import { buildPresenterFallback } from "#@/presenters";
import { cn } from "#@/util";

export interface DetailsBoxProps extends PropsWithChildren {
  enabled?: boolean;
  title: string;
  withDimmedTitle?: boolean;
  withBorder?: boolean;
  withPadding?: boolean;
  withBackground?: boolean;
  // Only available in mobile-native
  withRipple?: boolean;
  description?: string | undefined;
  stackProps?: StackProps;
  leftSide?: React.ReactNode;
  rightSide?: React.ReactNode;
}

const DEFAULT_DetailsBox = ({
  enabled = true,
  title,
  withDimmedTitle = false,
  withBorder = false,
  withPadding = false,
  withBackground = false,
  description,
  stackProps,
  leftSide,
  rightSide,
  children,
}: DetailsBoxProps) => {
  return (
    enabled && (
      <Stack
        {...stackProps}
        className={cn(
          "w-full h-fit gap-2",
          {
            "bg-paper-3": withBackground,
            "p-3": withPadding,
            "border-2 border-[#1F1F1F] rounded-xs": withBorder,
          },
          stackProps?.className,
        )}
      >
        <Group className={"justify-between"}>
          <Group>
            {leftSide}
            <Text
              className={
                withDimmedTitle ? "text-dimmed text-sm" : "font-bold text-md"
              }
            >
              {title}
            </Text>
          </Group>

          {rightSide}
        </Group>

        {description && (
          <Text fz={"sm"} lh={"md"} c={"dimmed"} className="">
            {description}
          </Text>
        )}
        {children}
      </Stack>
    )
  );
};

const DetailsBox = buildPresenterFallback("DetailsBox", DEFAULT_DetailsBox);

export { DetailsBox };
