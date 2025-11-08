import React from "react";
import { ActionIcon, Button, ModalProps } from "@mantine/core";
import { BaseModalProps, Modal } from "#@/util";
import { PreferredPlatformsView, useOnMobile } from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

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
