import { BaseModalProps } from "@/util/types/modal-props";
import { IonActionSheet } from "@ionic/react";
import React from "react";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {
  /**
   * If the 'Confirm' option means something is being deleted.
   */
  isDestructive?: boolean;
  onConfirm: () => void;
  title: string;
}

const ActionConfirm = ({
  title,
  onClose,
  opened,
  onConfirm,
  isDestructive = true,
}: Props) => {
  const { t } = useTranslation();

  return (
    <IonActionSheet
      header={title}
      isOpen={opened}
      onDidDismiss={onClose}
      buttons={[
        {
          text: t("actions.confirm"),
          role: isDestructive ? "destructive" : undefined,
          data: {
            action: "confirm",
          },
          handler: () => {
            onConfirm();
          },
        },
        {
          text: t("actions.cancel"),
          role: "cancel",
          data: {
            action: "cancel",
          },
          handler: () => {
            onClose();
          },
        },
      ]}
    />
  );
};

export { ActionConfirm };
