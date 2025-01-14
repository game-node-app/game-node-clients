import { BaseModalProps } from "@/util/types/modal-props";
import { IonActionSheet } from "@ionic/react";
import React from "react";

interface Props extends BaseModalProps {
    /**
     * If the 'Confirm' option means something is being deleted.
     */
    isDestructive?: boolean;
    onConfirm: () => void;
    title: string;
}

const ActionConfirm = ({ title, onClose, opened, onConfirm, isDestructive = true }: Props) => {
    return (
        <IonActionSheet
            header={title}
            isOpen={opened}
            onDidDismiss={onClose}
            buttons={[
                {
                    text: "Confirm",
                    role: isDestructive ? "destructive" : undefined,
                    data: {
                        action: "confirm",
                    },
                    handler: () => {
                        onConfirm();
                    },
                },
                {
                    text: "Cancel",
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

export default ActionConfirm;
