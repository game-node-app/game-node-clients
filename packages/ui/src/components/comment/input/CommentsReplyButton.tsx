import React from "react";
import { UserComment } from "#@/components";
import { IconMessageReply } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";

interface Props {
  comment: UserComment;
  onReplyClicked: (commentId: string) => void;
}

const CommentsReplyButton = ({ comment, onReplyClicked }: Props) => {
  if (comment.childOfId != undefined) {
    return null;
  }

  return (
    <ActionIcon
      variant={"subtle"}
      size={"xl"}
      color={"white"}
      onClick={() => onReplyClicked(comment.id)}
    >
      <IconMessageReply></IconMessageReply>
    </ActionIcon>
  );
};

export { CommentsReplyButton };
