import React, { useEffect, useRef } from "react";
import { Modal } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { ReviewListItem, useOnMobile, useReview } from "#@/components";

interface Props {
  reviewId: string | undefined;
}

/**
 * Component that renders a review in a modal. Will automatically be opened on render if 'reviewId' is present.
 * @constructor
 */
const ReviewListItemModal = ({ reviewId }: Props) => {
  const onMobile = useOnMobile();
  const [opened, { close, open }] = useDisclosure();

  const lastOpenedItem = useRef<string | null>(null);

  // Disabled if parameter is undefined
  const reviewQuery = useReview(opened ? reviewId : undefined);

  useEffect(() => {
    if (reviewId && lastOpenedItem.current !== reviewId) {
      open();
      lastOpenedItem.current = reviewId;
    }
  }, [open, reviewId]);

  if (reviewId == undefined || reviewQuery.data == undefined) {
    return null;
  }

  return (
    <Modal
      title={""}
      opened={opened}
      onClose={close}
      size={"lg"}
      fullScreen={onMobile}
    >
      <ReviewListItem review={reviewQuery.data} />
    </Modal>
  );
};

export { ReviewListItemModal };
