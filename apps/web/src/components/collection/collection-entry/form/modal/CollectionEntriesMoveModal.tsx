import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { Container, Modal } from "@mantine/core";
import CollectionEntriesMoveForm from "@/components/collection/collection-entry/form/CollectionEntriesMoveForm";

interface Props extends BaseModalProps {
    collectionId: string;
}

const CollectionEntriesMoveModal = ({
    opened,
    onClose,
    collectionId,
}: Props) => {
    return (
        <Modal opened={opened} onClose={onClose} title={"Move entries"}>
            <Modal.Body>
                <CollectionEntriesMoveForm
                    collectionId={collectionId}
                    onClose={onClose}
                />
            </Modal.Body>
        </Modal>
    );
};

export default CollectionEntriesMoveModal;
