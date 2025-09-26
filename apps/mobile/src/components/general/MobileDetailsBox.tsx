import { Box, Stack, Text } from "@mantine/core";
import React from "react";
import { cn, DetailsBoxProps } from "@repo/ui";

export const MobileDetailsBox = ({
  enabled = true,
  title,
  description,
  stackProps,
  children,
}: DetailsBoxProps) => {
  return (
    enabled && (
      <Box
        {...stackProps}
        className={cn(`bg-paper-alt-1 p-3 rounded`, "", stackProps?.className)}
      >
        <Text className={"text-dimmed text-sm font-medium mb-1"}>{title}</Text>
        {description && (
          <Text className="text-sm text-dimmed">{description}</Text>
        )}
        {children}
      </Box>
    )
  );
};
