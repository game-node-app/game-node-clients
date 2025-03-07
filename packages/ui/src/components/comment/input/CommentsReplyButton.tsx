import React from "react";
import { UserComment } from "#@/components";
import { IconMessageReply } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import { useCommentsContext } from "#@/components/comment/view/context.ts";

interface Props {
  comment: UserComment;
}

const CommentsReplyButton = ({ comment }: Props) => {
  const context = useCommentsContext();

  if (comment.childOfId != undefined) {
    return null;
  }

  return (
    <ActionIcon
      variant={"subtle"}
      size={"xl"}
      color={"white"}
      onClick={() => {
        context.updateContext({
          repliedCommentId: comment.id,
          repliedCommentProfileUserId: comment.profileUserId,
        });
      }}
    >
      <IconMessageReply></IconMessageReply>
    </ActionIcon>
  );
};

export { CommentsReplyButton };
