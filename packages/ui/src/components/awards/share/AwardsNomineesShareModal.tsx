import React from "react";
import { BaseModalProps, Modal } from "#@/util";
import { AwardsNomineesShareForm } from "#@/components/awards/share/AwardsNomineesShareForm.tsx";
import { useOnMobile } from "#@/components";

interface Props extends BaseModalProps {
  eventId: number;
  onShare: (file: File) => Promise<void>;
}

const AwardsNomineesShareModal = ({
  eventId,
  opened,
  onClose,
  onShare,
}: Props) => {
  const onMobile = useOnMobile();
  return (
    <Modal
      title={"Share your votes"}
      opened={opened}
      onClose={onClose}
      size={"xl"}
      fullScreen={onMobile}
    >
      <AwardsNomineesShareForm eventId={eventId} onShare={onShare} />
    </Modal>
  );
};

export { AwardsNomineesShareModal };
