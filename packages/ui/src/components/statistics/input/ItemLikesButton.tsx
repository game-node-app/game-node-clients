import React from "react";
import {
  IToggleLikeProps,
  useUserLike,
} from "#@/components/statistics/hooks/useUserLike";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ActionIcon, ActionIconProps, Text } from "@mantine/core";
import { redirectToAuth } from "supertokens-auth-react";
import { IconThumbUp } from "@tabler/icons-react";

interface Props extends IToggleLikeProps, ActionIconProps {}

const ItemLikesButton = ({
  targetUserId,
  sourceType,
  sourceId,
  ...others
}: Props) => {
  const userId = useUserId();
  const [likesCount, isLiked, toggleUserLike] = useUserLike({
    sourceId: sourceId,
    sourceType: sourceType,
    targetUserId: targetUserId,
  });

  return (
    <ActionIcon
      onClick={async () => {
        if (!userId) {
          redirectToAuth();
          return;
        }
        toggleUserLike();
      }}
      variant={isLiked ? "filled" : "subtle"}
      size={"xl"}
      color={isLiked ? "brand" : "white"}
      data-disabled={!userId}
      {...others}
    >
      <IconThumbUp />
      <Text>{likesCount}</Text>
    </ActionIcon>
  );
};

export { ItemLikesButton };
