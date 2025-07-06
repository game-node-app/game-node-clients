import React, { useMemo } from "react";
import { UserComment } from "#@/components/comment/types";
import { ActionIcon, Text } from "@mantine/core";
import { IconMessages } from "@tabler/icons-react";

interface Props {
  comment: UserComment;
  onClick: () => void;
}

const CommentsThreadButton = ({ comment, onClick }: Props) => {
  const children = comment.parentOf;

  const totalCommentsCount = useMemo(() => {
    if (children == undefined) {
      return 0;
    }

    return children.length;
  }, [children]);

  if (comment.childOfId != undefined) {
    return;
  }

  const hasComments = totalCommentsCount > 0;

  return (
    <ActionIcon
      onClick={onClick}
      variant={"subtle"}
      size={"xl"}
      color={hasComments ? "brand.4" : "white"}
    >
      <IconMessages className={"me-0.5"} />
      {totalCommentsCount > 0 && <Text>{totalCommentsCount}</Text>}
    </ActionIcon>
  );
};

export { CommentsThreadButton };
