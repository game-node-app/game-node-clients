import React from "react";
import { BaseModalProps, Modal } from "#@/util";
import { EditPreferredPlatformForm } from "#@/components";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {
  platformId?: number;
}

const EditPreferredPlatformModal = ({ platformId, onClose, opened }: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        platformId
          ? t("preferences.platforms.editTitle")
          : t("preferences.platforms.addTitle")
      }
      keepMounted={false}
    >
      <EditPreferredPlatformForm platformId={platformId} onClose={onClose} />
    </Modal>
  );
};

export { EditPreferredPlatformModal };
