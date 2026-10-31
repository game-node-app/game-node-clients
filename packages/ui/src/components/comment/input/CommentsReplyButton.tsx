import { UserComment } from "#@/components";
import { useCommentsContext } from "#@/components/comment/view/context.ts";
import { ActionIcon } from "@mantine/core";
import { IconMessageReply } from "@tabler/icons-react";

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