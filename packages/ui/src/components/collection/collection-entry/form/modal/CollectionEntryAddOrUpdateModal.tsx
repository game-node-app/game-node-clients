import React, { useState } from "react";
import { CollectionEntryAddOrUpdateForm } from "#@/components/collection/collection-entry/form/CollectionEntryAddOrUpdateForm";
import { BaseModalProps } from "#@/util/types/modal-props";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { Modal } from "#@/util";
import { PROJECT_CONTEXT } from "#@/util/projectContext.ts";

interface IGameAddModalProps extends BaseModalProps {
  id: number;
}

const CollectionEntryAddOrUpdateModal = ({
  opened,
  onClose,
  id,
}: IGameAddModalProps) => {
  const supportsBreakpoints = PROJECT_CONTEXT.client === "mobile";

  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    supportsBreakpoints ? 0.8 : 1,
  );
  const onMobile = useOnMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Add to your library"}
      fullScreen={onMobile}
      size={"lg"}
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
