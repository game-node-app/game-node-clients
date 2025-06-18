import React from "react";
import { useUserLevel } from "#@/components";
import { Text, TextProps } from "@mantine/core";
import clsx from "clsx";

interface Props extends TextProps {
  userId: string;
}

/**
 * Simple component that renders a text with the user's current level in the user leveling system.
 * @constructor
 */
const UserLevel = ({ userId, ...others }: Props) => {
  const userLevelQuery = useUserLevel(userId);
  const userLevel = userLevelQuery.data;

  return (
    <Text
      className={clsx("text-[#AAA5A5] font-semibold", others.className)}
      {...others}
    >
      Level {userLevel?.currentLevel ?? 1}
    </Text>
  );
};

export { UserLevel };
