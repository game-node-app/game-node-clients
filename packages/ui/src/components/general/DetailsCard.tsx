import React, { PropsWithChildren } from "react";
import { Stack, Title } from "@mantine/core";
import { cn } from "#@/util";

export type DetailsCardVariant = "card";

export interface DetailsCardProps {
  title: string;
  variant?: DetailsCardVariant;
}

/**
 * A card component meant to replace {@link DetailsBox} because it got too bloated.
 * This one uses a variant-based approach.
 * @constructor
 */
const DetailsCard = ({
  title,
  variant = "card",
  children,
}: PropsWithChildren<DetailsCardProps>) => {
  return (
    <Stack
      className={cn("w-full gap-2 h-fit", {
        "py-2 px-4 bg-paper-3 rounded-md": variant === "card",
      })}
    >
      <Title order={5} className={"font-bold text-xs text-dimmed"}>
        {title}
      </Title>
      {children}
    </Stack>
  );
};

export { DetailsCard };
