import React, { useMemo } from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { UserConnectionDto } from "@/wrapper/server";
import { Modal } from "@mantine/core";
import PreferencesConnectionSetup from "@/components/preferences/handlers/connections/PreferencesConnectionSetup";

interface Props extends BaseModalProps {
    type: UserConnectionDto.type;
}

const PreferencesConnectionModal = ({ opened, onClose, type }: Props) => {
    return (
        <Modal title={"Set up connection"} onClose={onClose} opened={opened}>
            <PreferencesConnectionSetup type={type} onClose={onClose} />
        </Modal>
    );
};

export default PreferencesConnectionModal;
