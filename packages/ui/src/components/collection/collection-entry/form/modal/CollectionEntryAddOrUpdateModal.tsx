import React, { useState } from "react";
import { CollectionEntryAddOrUpdateForm } from "@/components/collection/collection-entry/form/CollectionEntryAddOrUpdateForm";
import { BaseModalProps } from "@/util/types/modal-props";
import { useOnMobile } from "@/components/general/hooks/useOnMobile";
import { useUserId } from "@/components/auth/hooks/useUserId";
import { Modal } from "@/util";

interface IGameAddModalProps extends BaseModalProps {
  id: number;
}

const CollectionEntryAddOrUpdateModal = ({
  opened,
  onClose,
  id,
}: IGameAddModalProps) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState(0.8);
  const onMobile = useOnMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Add to your library"}
      fullScreen={onMobile}
      transitionProps={{ transition: "fade", duration: 200 }}
      breakpoints={[0.6, 0.8, 1]}
      initialBreakpoint={currentBreakpoint}
      onBreakpointChange={setCurrentBreakpoint}
    >
      <CollectionEntryAddOrUpdateForm
        gameId={id}
        onClose={onClose}
        showGameInfo={currentBreakpoint >= 1}
      />
    </Modal>
  );
};

export { CollectionEntryAddOrUpdateModal };
