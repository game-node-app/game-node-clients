import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { CollectionCreateOrUpdateForm } from "@/components/collection/form/CollectionCreateOrUpdateForm";
import { Modal } from "@/util";

interface ICreateCollectionModalProps extends BaseModalProps {
  /**
   * Existing collection id (for update actions)
   */
  collectionId: string | undefined | null;
}

const CollectionCreateOrUpdateModal = ({
  opened,
  onClose,
  collectionId,
}: ICreateCollectionModalProps) => {
  return (
    <Modal
      title={`${collectionId ? "Update" : "Create"} collection`}
      withCloseButton
      opened={opened}
      breakpoints={[0.5, 0.8, 1]}
      initialBreakpoint={0.8}
      onClose={() => onClose()}
    >
      <CollectionCreateOrUpdateForm
        onClose={onClose}
        collectionId={collectionId}
      />
    </Modal>
  );
};

export { CollectionCreateOrUpdateModal };
