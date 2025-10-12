import React from "react";
import { BaseModalProps, Modal } from "#@/util";
import { useQueryClient } from "@tanstack/react-query";
import collectionId from "web/src/pages/library/[userId]/collection/[collectionId]";
import { CollectionOrderingUpdateForm, useOnMobile } from "#@/components";

interface Props extends BaseModalProps {
  collectionId: string;
}

const CollectionOrderingUpdateModal = ({
  opened,
  onClose,
  collectionId,
}: Props) => {
  const queryClient = useQueryClient();
  const onMobile = useOnMobile();
  return (
    <Modal
      title={"Reorder Games"}
      opened={opened}
      fullScreen={onMobile}
      onClose={async () => {
        onClose();
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["collection-entries", "infinite", collectionId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["collection-entries", collectionId],
          }),
        ]);
      }}
    >
      <CollectionOrderingUpdateForm collectionId={collectionId} />
    </Modal>
  );
};

export { CollectionOrderingUpdateModal };
