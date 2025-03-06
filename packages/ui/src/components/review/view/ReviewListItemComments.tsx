import React, { useState } from "react";
import { FindAllCommentsDto, Review } from "@repo/wrapper/server";
import { Stack } from "@mantine/core";
import { CommentsListView } from "#@/components/comment/view/CommentsListView";
import { CommentEditorView } from "#@/components/comment/editor/CommentEditorView";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { ItemCommentsButton } from "#@/components/comment/input/ItemCommentsButton";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "#@/util";
import sourceType = FindAllCommentsDto.sourceType;

interface ReviewListItemCommentsProps {
  review: Review;
}

const ReviewListItemComments = ({ review }: ReviewListItemCommentsProps) => {
  const onMobile = useOnMobile();
  const [commentsModalOpened, commentsModalUtils] = useDisclosure();
  const [repliedCommentId, setRepliedCommentId] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      <Modal
        title={"Comments in this review"}
        opened={commentsModalOpened}
        onClose={commentsModalUtils.close}
        size={"xl"}
        fullScreen={onMobile}
      >
        <Stack className={`w-full h-full`}>
          <CommentsListView
            enabled={commentsModalOpened}
            sourceId={review.id}
            sourceType={sourceType.REVIEW}
            onReplyClicked={setRepliedCommentId}
          />
          <CommentEditorView
            sourceType={sourceType.REVIEW}
            sourceId={review.id}
            onEditEnd={() => setRepliedCommentId(undefined)}
            childOf={repliedCommentId}
          />
        </Stack>
      </Modal>
      <ItemCommentsButton
        onClick={commentsModalUtils.open}
        sourceId={review.id}
        sourceType={FindAllCommentsDto.sourceType.REVIEW}
      />
    </>
  );
};

export { ReviewListItemComments };
