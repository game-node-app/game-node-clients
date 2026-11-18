import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CommentsReplyButton } from "#@/components/comment/input/CommentsReplyButton.tsx";
import { CommentsThreadButton } from "#@/components/comment/input/CommentsThreadButton";
import type { CommentSource, UserComment } from "#@/components/comment/types";
import { getCommentReportType } from "#@/components/comment/util/getCommentReportType.ts";
import { getCommentStatisticsType } from "#@/components/comment/util/getCommentStatisticsType.ts";
import { CommentsRemoveModal } from "#@/components/comment/view/CommentsRemoveModal";
import { ItemDropdown } from "#@/components/general/input/ItemDropdown/ItemDropdown";
import { ReportCreateFormModal } from "#@/components/report/modal/ReportCreateFormModal";
import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import { Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface Props extends CommentSource {
  comment: UserComment;
  onEditStart: (commentId: string) => void;
  onCommentThreadClick: () => void;
}

const CommentsListItemActions = ({
  comment,
  sourceId,
  sourceType,
  onEditStart,
  onCommentThreadClick,
}: Props) => {
  const ownUserId = useUserId();

  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [reportModalOpened, reportModalUtils] = useDisclosure();

  const isOwnComment =
    ownUserId != undefined && comment.profileUserId === ownUserId;

  return (
    <Group className={"w-full justify-end"}>
      <CommentsRemoveModal
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
        commentId={comment.id}
        sourceId={sourceId}
        sourceType={sourceType}
      />
      <ReportCreateFormModal
        opened={reportModalOpened}
        onClose={reportModalUtils.close}
        sourceId={comment.id}
        sourceType={getCommentReportType(sourceType)}
      />

      <CommentsReplyButton comment={comment} />
      <CommentsThreadButton comment={comment} onClick={onCommentThreadClick} />

      <ItemLikesButton
        sourceId={comment.id}
        sourceType={getCommentStatisticsType(sourceType)}
      />

      <ItemDropdown>
        {isOwnComment ? (
          <>
            <ItemDropdown.EditButton
              onClick={() => {
                onEditStart(comment.id);
              }}
              disabled={!isOwnComment}
            />
            <ItemDropdown.RemoveButton
              onClick={() => {
                removeModalUtils.open();
              }}
              disabled={!isOwnComment}
            />
          </>
        ) : (
          <ItemDropdown.ReportButton
            onClick={() => {
              reportModalUtils.open();
            }}
          />
        )}
      </ItemDropdown>
    </Group>
  );
};

export { CommentsListItemActions };
