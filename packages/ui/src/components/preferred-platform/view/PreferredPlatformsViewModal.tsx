import { PreferredPlatformsView, useOnMobile } from "#@/components";
import { BaseModalProps, Modal } from "#@/util";
import React from "react";

interface Props extends BaseModalProps {}

const PreferredPlatformsViewModal = ({ opened, onClose }: Props) => {
  const onMobile = useOnMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Edit your preferred platforms"}
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
