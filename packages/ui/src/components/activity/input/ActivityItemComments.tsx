import React from "react";
import { ItemCommentsButton } from "#@/components/comment/input/ItemCommentsButton";
import { Activity, FindAllCommentsDto } from "@repo/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { Stack } from "@mantine/core";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { CommentsListView } from "#@/components/comment/view/CommentsListView";
import { CommentEditorView } from "#@/components/comment/editor/CommentEditorView";
import { Modal } from "#@/util";
import { CommentsView } from "#@/components/comment/view/CommentsView.tsx";
import sourceType = FindAllCommentsDto.sourceType;

interface Props {
  activity: Activity;
}

const ActivityItemComments = ({ activity }: Props) => {
  const onMobile = useOnMobile();
  const [commentsModalOpened, commentsModalUtils] = useDisclosure();

  return (
    <>
      <Modal
        title={"Comments in this activity"}
        opened={commentsModalOpened}
        onClose={commentsModalUtils.close}
        size={"xl"}
        fullScreen={onMobile}
        classNames={{
          body: "flex flex-col min-h-[92vh]",
        }}
      >
        <CommentsView>
          <CommentsListView
            enabled={commentsModalOpened}
            sourceId={activity.id}
            sourceType={sourceType.ACTIVITY}
          />
          <CommentEditorView
            sourceType={sourceType.ACTIVITY}
            sourceId={activity.id}
          />
        </CommentsView>
      </Modal>
      <ItemCommentsButton
        sourceType={sourceType.ACTIVITY}
        sourceId={activity.id}
        onClick={commentsModalUtils.open}
      />
    </>
  );
};

export { ActivityItemComments };
