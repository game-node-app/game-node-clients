import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import {
  ReportCreateFormProps,
  ReportCreateForm,
} from "@/components/report/form/ReportCreateForm";
import { Modal } from "@/util";

type Props = BaseModalProps & ReportCreateFormProps;

const ReportCreateFormModal = ({
  opened,
  onClose,
  sourceType,
  sourceId,
}: Props) => {
  return (
    <Modal title={"Report content"} onClose={onClose} opened={opened}>
      <ReportCreateForm
        sourceId={sourceId}
        sourceType={sourceType}
        onSuccess={onClose}
      />
    </Modal>
  );
};

export { ReportCreateFormModal };
