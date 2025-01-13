import React, { useMemo } from "react";
import { CreateReportRequestDto, FindOneStatisticsDto } from "@/wrapper/server";
import { UserComment } from "@/components/comment/types";
import { Group } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import ItemDropdown from "@/components/general/input/dropdown/ItemDropdown";
import CommentsRemoveModal from "@/components/comment/view/CommentsRemoveModal";
import { useDisclosure } from "@mantine/hooks";
import ReportCreateFormModal from "@/components/report/modal/ReportCreateFormModal";
import ItemLikesButton from "@/components/statistics/input/ItemLikesButton";
import CommentsThreadButton from "@/components/comment/input/CommentsThreadButton";

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
        if (Object.hasOwn(comment, "reviewId")) {
            return FindOneStatisticsDto.sourceType.REVIEW_COMMENT;
        } else if (Object.hasOwn(comment, "activityId")) {
            return FindOneStatisticsDto.sourceType.ACTIVITY_COMMENT;
        }

        return FindOneStatisticsDto.sourceType.REVIEW_COMMENT;
    }, [comment]);

    const reportType = useMemo(() => {
        if (Object.hasOwn(comment, "reviewId")) {
            return CreateReportRequestDto.sourceType.REVIEW_COMMENT;
        } else if (Object.hasOwn(comment, "activityId")) {
            return CreateReportRequestDto.sourceType.ACTIVITY_COMMENT;
        }

        return CreateReportRequestDto.sourceType.REVIEW_COMMENT;
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

            <CommentsThreadButton
                comment={comment}
                onClick={onCommentThreadClick}
            />

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

export default CommentsListItemActions;
