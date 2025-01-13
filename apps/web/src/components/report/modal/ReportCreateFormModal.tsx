import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import ReportCreateForm, {
    ReportCreateFormProps,
} from "@/components/report/form/ReportCreateForm";
import { Modal } from "@mantine/core";

type Props = BaseModalProps & ReportCreateFormProps;

const ReportCreateFormModal = ({
    opened,
    onClose,
    sourceType,
    sourceId,
}: Props) => {
    return (
        <Modal title={"Report content"} onClose={onClose} opened={opened}>
            <Modal.Body>
                <ReportCreateForm
                    sourceId={sourceId}
                    sourceType={sourceType}
                    onSuccess={onClose}
                />
            </Modal.Body>
        </Modal>
    );
};

export default ReportCreateFormModal;
