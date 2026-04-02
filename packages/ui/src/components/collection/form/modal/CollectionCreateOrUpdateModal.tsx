import React from "react";
import { BaseModalProps } from "#@/util/types/modal-props";
import { CollectionCreateOrUpdateForm } from "#@/components/collection/form/CollectionCreateOrUpdateForm";
import { Modal } from "#@/util";
import { useTranslation } from "@repo/locales";

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
  const { t } = useTranslation();
  return (
    <Modal
      title={collectionId ? t("collection.titles.updateModal") : t("collection.titles.createModal")}
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
