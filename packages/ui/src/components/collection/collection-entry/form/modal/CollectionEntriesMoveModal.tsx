import { CollectionEntriesMoveForm } from "#@/components/collection/collection-entry/form/CollectionEntriesMoveForm";
import { Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {
  collectionId: string;
}

const CollectionEntriesMoveModal = ({
  opened,
  onClose,
  collectionId,
}: Props) => {
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("collection.titles.moveGames")}
    >
      <CollectionEntriesMoveForm
        collectionId={collectionId}
        onClose={onClose}
      />
    </Modal>
  );
};

export { CollectionEntriesMoveModal };