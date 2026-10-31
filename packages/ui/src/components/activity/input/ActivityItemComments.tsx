import { CommentEditorView } from "#@/components/comment/editor/CommentEditorView";
import { ItemCommentsButton } from "#@/components/comment/input/ItemCommentsButton";
import { CommentsListView } from "#@/components/comment/view/CommentsListView";
import { CommentsView } from "#@/components/comment/view/CommentsView.tsx";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { Modal } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { Activity, FindAllCommentsDto } from "@repo/wrapper/server";
import sourceType = FindAllCommentsDto.sourceType;

interface Props {
  activity: Activity;
}

const ActivityItemComments = ({ activity }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const [commentsModalOpened, commentsModalUtils] = useDisclosure();

  return (
    <>
      <Modal
        title={t("comment.titles.commentsInActivity")}
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