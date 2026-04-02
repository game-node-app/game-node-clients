import React, { useState } from "react";
import { BaseModalProps } from "#@/util/types/modal-props";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { Modal } from "#@/util";
import { PROJECT_CONTEXT } from "#@/util/projectContext.ts";
import {
  CollectionEntryEditForm,
  useOwnCollectionEntryForGameId,
} from "#@/components";
import { useTranslation } from "@repo/locales";

interface IGameAddModalProps extends BaseModalProps {
  gameId: number;
}

const CollectionEntryEditModal = ({
  opened,
  onClose,
  gameId,
}: IGameAddModalProps) => {
  const { t } = useTranslation();
  const supportsBreakpoints = PROJECT_CONTEXT.client === "mobile";

  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    supportsBreakpoints ? 0.8 : 1,
  );

  const onMobile = useOnMobile();

  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId, opened);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        collectionEntryQuery.data != undefined
          ? t("collectionEntry.titles.editGame")
          : t("collectionEntry.titles.addGame")
      }
      fullScreen={onMobile}
      size={"xl"}
      breakpoints={[0.6, 0.8, 1]}
      initialBreakpoint={currentBreakpoint}
      onBreakpointChange={setCurrentBreakpoint}
      classNames={{
        body: "py-0",
      }}
    >
      <CollectionEntryEditForm
        gameId={gameId}
        onClose={onClose}
        showGameInfo={currentBreakpoint >= 1}
      />
    </Modal>
  );
};

export { CollectionEntryEditModal };
