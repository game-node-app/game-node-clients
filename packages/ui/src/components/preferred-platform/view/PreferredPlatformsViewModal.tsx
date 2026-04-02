import { PreferredPlatformsView, useOnMobile } from "#@/components";
import { BaseModalProps, Modal } from "#@/util";
import React from "react";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {}

const PreferredPlatformsViewModal = ({ opened, onClose }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("preferences.titles.editPreferredPlatforms")}
      size={"lg"}
      fullScreen={onMobile}
      classNames={{
        body: "flex flex-col w-full gap-4",
      }}
    >
      <PreferredPlatformsView />
    </Modal>
  );
};

export { PreferredPlatformsViewModal };
