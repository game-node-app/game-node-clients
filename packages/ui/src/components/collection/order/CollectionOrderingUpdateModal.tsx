import { CollectionOrderingUpdateForm, useOnMobile } from "#@/components";
import { BaseModalProps } from "#@/util";
import { Modal } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";

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