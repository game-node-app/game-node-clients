import React, { useEffect } from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import CollectionCreateOrUpdateForm from "@/components/collection/form/CollectionCreateOrUpdateForm";
import { Modal } from "@mantine/core";
import { useCollection } from "@/components/collection/hooks/useCollection";

interface ICreateCollectionModalProps extends BaseModalProps {
    /**
     * Existing collection id (for update actions)
     */
    collectionId?: string;
}

const CollectionCreateOrUpdateModal = ({
    opened,
    onClose,
    collectionId,
}: ICreateCollectionModalProps) => {
    return (
        <Modal
            title={`${collectionId ? "Update" : "Create"} collection`}
            withCloseButton
            opened={opened}
            onClose={() => onClose()}
        >
            <CollectionCreateOrUpdateForm
                onClose={onClose}
                collectionId={collectionId}
            />
        </Modal>
    );
};

export default CollectionCreateOrUpdateModal;
