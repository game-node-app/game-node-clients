import React from "react";
import { BaseModalProps } from "#@/util/types/modal-props";
import { CollectionEntriesMoveForm } from "#@/components/collection/collection-entry/form/CollectionEntriesMoveForm";
import { Modal } from "#@/util";

interface Props extends BaseModalProps {
  collectionId: string;
}

const CollectionEntriesMoveModal = ({
  opened,
  onClose,
  collectionId,
}: Props) => {
  return (
    <Modal opened={opened} onClose={onClose} title={"Move entries"}>
      <CollectionEntriesMoveForm
        collectionId={collectionId}
        onClose={onClose}
      />
    </Modal>
  );
};

export { CollectionEntriesMoveModal };
