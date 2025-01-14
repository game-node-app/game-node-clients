import React from "react";
import { CreateReportRequestDto, Review } from "@/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import ReviewListItemRemoveModal from "@/components/review/view/ReviewListItemRemoveModal";
import useUserId from "@/components/auth/hooks/useUserId";
import ItemDropdown from "@/components/general/input/dropdown/ItemDropdown";
import ReportCreateFormModal from "@/components/report/modal/ReportCreateFormModal";
import GameInfoReviewCreateUpdateModal from "@/components/game/info/review/editor/GameInfoReviewCreateUpdateModal";
import GameInfoShareModal from "@/components/game/info/share/GameInfoShareModal";

interface IReviewListItemDropdownProps {
    review: Review;
}

const ReviewListItemDropdownButton = ({ review }: IReviewListItemDropdownProps) => {
    const ownUserId = useUserId();
    const isOwnReview = ownUserId != undefined && ownUserId === review.profileUserId;

    const [reviewRemoveModalOpened, reviewRemoveModalUtils] = useDisclosure();
    const [reportFormModalOpened, reportFormModalUtils] = useDisclosure();
    const [reviewEditModalOpened, reviewEditModalUtils] = useDisclosure();
    const [shareModalOpened, shareModalUtils] = useDisclosure();

    return (
        <>
            <GameInfoShareModal gameId={review.gameId} opened={shareModalOpened} onClose={shareModalUtils.close} />
            <GameInfoReviewCreateUpdateModal
                opened={reviewEditModalOpened}
                onClose={reviewEditModalUtils.close}
                gameId={review.gameId}
            />
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
                        <ItemDropdown.ShareButton
                            onClick={() => {
                                shareModalUtils.open();
                            }}
                        />
                        <ItemDropdown.EditButton
                            onClick={() => {
                                reviewEditModalUtils.open();
                            }}
                            disabled={reviewEditModalOpened}
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
