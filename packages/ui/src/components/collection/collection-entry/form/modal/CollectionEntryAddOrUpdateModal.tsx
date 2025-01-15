import React from "react";
import { CollectionEntryAddOrUpdateForm } from "@/components/collection/collection-entry/form/CollectionEntryAddOrUpdateForm";
import { BaseModalProps } from "@/util/types/modal-props";
import { useOnMobile } from "@/components/general/hooks/useOnMobile";
import { useUserId } from "@/components/auth/hooks/useUserId";
import { Modal } from "@/util";

interface IGameAddModalProps extends BaseModalProps {
  id: number;
}

const CollectionEntryAddOrUpdateModal = ({
  opened,
  onClose,
  id,
}: IGameAddModalProps) => {
  const onMobile = useOnMobile();
  const userId = useUserId();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Add to your library"}
      fullScreen={onMobile}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <CollectionEntryAddOrUpdateForm gameId={id} onClose={onClose} />
    </Modal>
  );
};

export { CollectionEntryAddOrUpdateModal };
