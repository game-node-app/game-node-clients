import React, { PropsWithChildren } from "react";
import { Group, Stack, StackProps, Text } from "@mantine/core";

export interface DetailsBoxProps extends PropsWithChildren {
  enabled?: boolean;
  title: string;
  withDimmedTitle?: boolean;
  withBorder?: boolean;
  withPadding?: boolean;
  description?: string | undefined;
  stackProps?: StackProps;
  leftSide?: React.ReactNode;
  rightSide?: React.ReactNode;
}

export const DetailsBox = ({
  enabled = true,
  title,
  withDimmedTitle = false,
  withBorder = false,
  withPadding = false,
  description,
  stackProps,
  leftSide,
  rightSide,
  children,
}: DetailsBoxProps) => {
  return (
    enabled && (
      <Stack
        w={"100%"}
        h={"fit-content"}
        styles={{
          root: {
            padding: withPadding ? "0.75rem" : undefined,
            borderWidth: withBorder ? "2px" : undefined,
            borderColor: withBorder ? "#1F1F1F" : undefined,
            borderRadius: withBorder ? "6px" : undefined,
            backgroundColor: "#191919",
          },
        }}
        gap={"0.5rem"}
        {...stackProps}
      >
        <Group className={"justify-between"}>
          <Group>
            {leftSide}
            <Text
              className={
                withDimmedTitle ? "text-[#5C5C5C] text-sm" : "font-bold text-md"
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
