import React from "react";
import { Button, ButtonProps, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface Props extends Omit<ButtonProps, "onClick"> {
  label: string;
  message: string;
  onConfirm: () => void;
}

/** @mantine/modals is pinned to v8 while core is v9, so the confirm dialog is built on core's Modal. */
const ConfirmButton = ({ label, message, onConfirm, ...others }: Props) => {
  const [opened, { open, close }] = useDisclosure();
  return (
    <>
      <Modal opened={opened} onClose={close} title={label}>
        <Stack>
          <Text>{message}</Text>
          <Group justify={"end"}>
            <Button variant={"default"} onClick={close}>
              Cancel
            </Button>
            <Button
              color={others.color}
              onClick={() => {
                close();
                onConfirm();
              }}
            >
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Button variant={"light"} {...others} onClick={open}>
        {label}
      </Button>
    </>
  );
};

export { ConfirmButton };
