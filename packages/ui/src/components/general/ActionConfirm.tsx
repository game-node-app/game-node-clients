import React from "react";
import { BaseModalProps, Modal } from "#@/util";
import { Button, Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {
  title?: string;
  message?: string;
  onConfirm: () => void;
}

const ActionConfirm = ({
  title,
  message,
  onConfirm,
  onClose,
  opened,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title ?? t("confirm.title")}
      centered
      initialBreakpoint={0.5}
      breakpoints={[0.5, 1]}
    >
      <Text className={"text-center"}>{message ?? t("confirm.message")}</Text>
      <Group className={"w-full justify-center gap-3"} mt="md">
        <Button variant="outline" onClick={onClose}>
          {t("actions.cancel")}
        </Button>
        <Button
          color="red"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {t("actions.confirm")}
        </Button>
      </Group>
    </Modal>
  );
};

export { ActionConfirm };
