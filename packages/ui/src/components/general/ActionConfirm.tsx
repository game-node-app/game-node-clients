import React from "react";
import { BaseModalProps, Modal } from "#@/util";
import { Button, Group, Text } from "@mantine/core";

interface Props extends BaseModalProps {
  title?: string;
  message?: string;
  onConfirm: () => void;
}

const ActionConfirm = ({
  title = "Confirm action",
  message = "Are you sure you want to do this?",
  onConfirm,
  onClose,
  opened,
}: Props) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      initialBreakpoint={0.5}
      breakpoints={[0.5, 1]}
    >
      <Text className={"text-center"}>{message}</Text>
      <Group className={"w-full justify-center gap-3"} mt="md">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm
        </Button>
      </Group>
    </Modal>
  );
};

export { ActionConfirm };
