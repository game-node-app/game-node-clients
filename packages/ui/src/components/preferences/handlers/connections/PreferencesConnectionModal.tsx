import { BaseModalProps } from "#@/util/types/modal-props";
import { UserConnectionDto } from "@repo/wrapper/server";
import { PreferencesConnectionSetup } from "#@/components/preferences/handlers/connections/PreferencesConnectionSetup";
import { Modal } from "#@/util";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {
  type: UserConnectionDto.type;
  // eslint-disable-next-line no-unused-vars
  onRedirect?: (url: string) => void | Promise<void>;
}

const PreferencesConnectionModal = ({
  opened,
  onClose,
  type,
  onRedirect,
}: Props) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("preferences.titles.connectionSetup")}
      onClose={onClose}
      opened={opened}
    >
      <PreferencesConnectionSetup
        type={type}
        onClose={onClose}
        onRedirect={onRedirect}
      />
    </Modal>
  );
};

export { PreferencesConnectionModal };
