import React from "react";
import { BaseModalProps } from "#@/util/types/modal-props";
import { UserConnectionDto } from "@repo/wrapper/server";
import { PreferencesConnectionSetup } from "#@/components/preferences/handlers/connections/PreferencesConnectionSetup";
import { Modal } from "#@/util";

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

export { PreferencesConnectionModal };
