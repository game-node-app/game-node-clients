import React from "react";
import { FindAllCommentsDto, Review } from "@/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import ItemCommentsButton from "@/components/comment/input/ItemCommentsButton";
import CommentsViewModal from "@/components/comment/view/CommentsViewModal";
import sourceType = FindAllCommentsDto.sourceType;

interface ReviewListItemCommentsProps {
    review: Review;
}

const ReviewListItemComments = ({ review }: ReviewListItemCommentsProps) => {
    const [commentModalOpened, commentModalUtils] = useDisclosure();
    return (
        <>
            <CommentsViewModal
                opened={commentModalOpened}
                onClose={commentModalUtils.close}
                sourceId={review.id}
                sourceType={sourceType.REVIEW}
            />
            <ItemCommentsButton onClick={commentModalUtils.open} sourceId={review.id} sourceType={sourceType.REVIEW} />
        </>
    );
};

export default ReviewListItemComments;
