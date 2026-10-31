import {
  ReportCreateForm,
  ReportCreateFormProps,
} from "#@/components/report/form/ReportCreateForm";
import { Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";

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