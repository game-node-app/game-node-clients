import { CollectionCreateOrUpdateForm } from "#@/components/collection/form/CollectionCreateOrUpdateForm";
import { Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { useTranslation } from "@repo/locales";
import { Collection } from "@repo/wrapper/server";

interface ICreateCollectionModalProps extends BaseModalProps {
  /**
   * Existing collection id (for update actions)
   */
  collectionId: string | undefined | null;
  /**
   * Called after a new collection is created.
   */
  onCreated?: (collection: Collection) => void;
}

const CollectionCreateOrUpdateModal = ({
  opened,
  onClose,
  collectionId,
  onCreated,
}: ICreateCollectionModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={
        collectionId
          ? t("collection.titles.updateModal")
          : t("collection.titles.createModal")
      }
      withCloseButton
      opened={opened}
      breakpoints={[0.5, 0.8, 1]}
      initialBreakpoint={0.8}
      onClose={() => onClose()}
    >
      <CollectionCreateOrUpdateForm
        onClose={onClose}
        collectionId={collectionId}
        onCreated={onCreated}
      />
    </Modal>
  );
};

export { CollectionCreateOrUpdateModal };
