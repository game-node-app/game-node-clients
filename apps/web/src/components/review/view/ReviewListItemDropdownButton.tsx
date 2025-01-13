import React from "react";
import { CreateReportRequestDto, Review } from "@/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import ReviewListItemRemoveModal from "@/components/review/view/ReviewListItemRemoveModal";
import useUserId from "@/components/auth/hooks/useUserId";
import ItemDropdown from "@/components/general/input/dropdown/ItemDropdown";
import ReportCreateFormModal from "@/components/report/modal/ReportCreateFormModal";

interface IReviewListItemDropdownProps {
    review: Review;
    onEditStart?: () => void;
}

const ReviewListItemDropdownButton = ({
    review,
    onEditStart,
}: IReviewListItemDropdownProps) => {
    const ownUserId = useUserId();
    const isOwnReview =
        ownUserId != undefined && ownUserId === review.profileUserId;

    const [reviewRemoveModalOpened, reviewRemoveModalUtils] = useDisclosure();
    const [reportFormModalOpened, reportFormModalUtils] = useDisclosure();

    return (
        <>
            <ReviewListItemRemoveModal
                reviewId={review.id}
                onClose={reviewRemoveModalUtils.close}
                opened={reviewRemoveModalOpened}
            />
            <ReportCreateFormModal
                opened={reportFormModalOpened}
                onClose={reportFormModalUtils.close}
                sourceId={review.id}
                sourceType={CreateReportRequestDto.sourceType.REVIEW}
            />
            <ItemDropdown>
                {isOwnReview ? (
                    <>
                        <ItemDropdown.EditButton
                            onClick={() => {
                                if (onEditStart) {
                                    onEditStart();
                                }
                            }}
                            disabled={!onEditStart}
                        />
                        <ItemDropdown.RemoveButton
                            onClick={() => {
                                reviewRemoveModalUtils.open();
                            }}
                        />
                    </>
                ) : (
                    <ItemDropdown.ReportButton
                        onClick={() => {
                            reportFormModalUtils.open();
                        }}
                    />
                )}
            </ItemDropdown>
        </>
    );
};

export default ReviewListItemDropdownButton;
