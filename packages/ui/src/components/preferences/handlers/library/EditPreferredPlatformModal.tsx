import React from "react";
import { BaseModalProps, Modal } from "#@/util";
import { EditPreferredPlatformForm } from "#@/components";

interface Props extends BaseModalProps {
  platformId?: number;
}

const EditPreferredPlatformModal = ({ platformId, onClose, opened }: Props) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={platformId ? "Edit Preferred Platform" : "Add Preferred Platform"}
      keepMounted={false}
    >
      <EditPreferredPlatformForm platformId={platformId} onClose={onClose} />
    </Modal>
  );
};

export { EditPreferredPlatformModal };
