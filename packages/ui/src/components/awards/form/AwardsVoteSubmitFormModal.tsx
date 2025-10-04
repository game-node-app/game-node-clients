import React from "react";
import { BaseModalProps, Modal } from "#@/util";
import {
  AwardsVoteSubmitForm,
  AwardsVoteSubmitFormProps,
} from "#@/components/awards/form/AwardsVoteSubmitForm.tsx";
import { useOnMobile } from "#@/components";

type Props = AwardsVoteSubmitFormProps & BaseModalProps;

const AwardsVoteSubmitFormModal = ({ opened, onClose, ...others }: Props) => {
  const onMobile = useOnMobile();

  return (
    <Modal
      title={"Submit your vote"}
      opened={opened}
      onClose={onClose}
      fullScreen={onMobile}
      size={"lg"}
      breakpoints={[0.5, 0.75, 1]}
      initialBreakpoint={1}
    >
      <AwardsVoteSubmitForm onClose={onClose} {...others} />
    </Modal>
  );
};

export { AwardsVoteSubmitFormModal };
