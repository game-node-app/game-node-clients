import {
  ReportCreateForm,
  ReportCreateFormProps,
} from "#@/components/report/form/ReportCreateForm";
import { Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { useTranslation } from "@repo/locales";

type Props = BaseModalProps & ReportCreateFormProps;

const ReportCreateFormModal = ({
  opened,
  onClose,
  sourceType,
  sourceId,
}: Props) => {
  const { t } = useTranslation();
  return (
    <Modal title={t("reports.title")} onClose={onClose} opened={opened}>
      <ReportCreateForm
        sourceId={sourceId}
        sourceType={sourceType}
        onSuccess={onClose}
      />
    </Modal>
  );
};

export { ReportCreateFormModal };
