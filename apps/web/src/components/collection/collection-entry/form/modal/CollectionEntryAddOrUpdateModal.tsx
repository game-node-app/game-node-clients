import React, { useEffect, useState } from "react";
import { Container, Modal } from "@mantine/core";
import LoginPromptCentered from "@/components/general/LoginPromptCentered";
import CollectionEntryAddOrUpdateForm from "@/components/collection/collection-entry/form/CollectionEntryAddOrUpdateForm";
import { BaseModalProps } from "@/util/types/modal-props";
import {
    SessionAuth,
    useSessionContext,
} from "supertokens-auth-react/recipe/session";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import { useRouter } from "next/router";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import useUserId from "@/components/auth/hooks/useUserId";

interface IGameAddModalProps extends BaseModalProps {
    id: number;
}

const CollectionEntryAddOrUpdateModal = ({
    opened,
    onClose,
    id,
}: IGameAddModalProps) => {
    const onMobile = useOnMobile();
    const userId = useUserId();
    const userLibrary = useUserLibrary(userId);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={"Add to your library"}
            fullScreen={onMobile}
            transitionProps={{ transition: "fade", duration: 200 }}
        >
            <Modal.Body>
                <Container fluid h={"100%"} className={""}>
                    <CollectionEntryAddOrUpdateForm
                        gameId={id}
                        onClose={onClose}
                    />
                </Container>
            </Modal.Body>
        </Modal>
    );
};

export default CollectionEntryAddOrUpdateModal;
