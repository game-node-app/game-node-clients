import { Stack, Text } from "@mantine/core";
import React from "react";
import { cn, DetailsBoxProps } from "@repo/ui";
import { IonRippleEffect } from "@ionic/react";

export const MobileDetailsBox = ({
  enabled = true,
  title,
  withDimmedTitle = false,
  withPadding = false,
  withBackground = false,
  withRipple = false,
  description,
  stackProps,
  children,
}: DetailsBoxProps) => {
  return (
    enabled && (
      <Stack
        {...stackProps}
        className={cn(
          "gap-2 w-full h-fit rounded-md",
          {
            "bg-paper-2": withBackground,
            "p-3": withPadding,
            "relative ion-activatable": withRipple,
          },
          stackProps?.className,
        )}
      >
        {withRipple && <IonRippleEffect className={"rounded-md"} />}
        <Text
          className={
            withDimmedTitle
              ? "text-dimmed text-sm font-medium mb-1"
              : "text-md font-medium mb-1"
          }
        >
          {title}
        </Text>
        {description && (
          <Text className="text-sm text-dimmed mb-1">{description}</Text>
        )}
        {children}
      </Stack>
    )
  );
};
