import {
  CollectionEntryEditModal,
  CollectionEntryRemoveModal,
  PreferredPlatformsViewModal,
} from "@repo/ui";
import { useCommandCenterContext } from "./context/CommandCenterContext";

export const CommandCenterModalOutlet = () => {
  const { modal, payload, closeModal } = useCommandCenterContext();

  console.log("Rendering CommandCenterModalOutlet with modal:", modal);

  return (
    <>
      {payload != null && modal === "gameAddEditForm" && (
        <CollectionEntryEditModal
          opened={true}
          onClose={closeModal}
          gameId={payload.id!}
        />
      )}
      {payload != null && modal === "gameRemoveForm" && (
        <CollectionEntryRemoveModal
          opened={true}
          onClose={closeModal}
          gameId={payload.id!}
        />
      )}
      <PreferredPlatformsViewModal
        opened={modal === "preferredPlatforms"}
        onClose={closeModal}
      />
    </>
  );
};
