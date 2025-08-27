import React, { useMemo } from "react";
import { UserComment } from "#@/components/comment/types";
import { Group } from "@mantine/core";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ItemDropdown } from "#@/components/general/input/ItemDropdown/ItemDropdown";
import { CommentsRemoveModal } from "#@/components/comment/view/CommentsRemoveModal";
import { useDisclosure } from "@mantine/hooks";
import { ReportCreateFormModal } from "#@/components/report/modal/ReportCreateFormModal";
import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import { CommentsThreadButton } from "#@/components/comment/input/CommentsThreadButton";
import { getCommentStatisticsType } from "#@/components/comment/util/getCommentStatisticsType.ts";
import { getCommentReportType } from "#@/components/comment/util/getCommentReportType.ts";
import { CommentsReplyButton } from "#@/components/comment/input/CommentsReplyButton.tsx";

interface Props {
  comment: UserComment;
  onEditStart: (commentId: string) => void;
  onCommentThreadClick: () => void;
}

const CommentsListItemActions = ({
  comment,
  onEditStart,
  onCommentThreadClick,
}: Props) => {
  const ownUserId = useUserId();

  const statisticsType = useMemo(() => {
    return getCommentStatisticsType(comment);
  }, [comment]);

  const reportType = useMemo(() => {
    return getCommentReportType(comment);
  }, [comment]);

  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [reportModalOpened, reportModalUtils] = useDisclosure();

  const isOwnComment =
    ownUserId != undefined && comment.profileUserId === ownUserId;

  return (
    <Group className={"w-full justify-end"}>
      <CommentsRemoveModal
        opened={removeModalOpened}
        onClose={removeModalUtils.close}
        comment={comment}
      />
      <ReportCreateFormModal
        opened={reportModalOpened}
        onClose={reportModalUtils.close}
        sourceId={comment.id}
        sourceType={reportType}
      />

      <CommentsReplyButton comment={comment} />
      <CommentsThreadButton comment={comment} onClick={onCommentThreadClick} />

      <ItemLikesButton
        sourceId={comment.id}
        sourceType={statisticsType}
        targetUserId={comment.profileUserId}
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
