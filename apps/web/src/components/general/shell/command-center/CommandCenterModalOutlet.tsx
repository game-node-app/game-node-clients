import { PreferredPlatformsViewModal } from "@repo/ui";
import { useCommandCenterContext } from "./context/CommandCenterContext";

export const CommandCenterModalOutlet = () => {
  const { modal, closeModal } = useCommandCenterContext();

  console.log("Rendering CommandCenterModalOutlet with modal:", modal);

  return (
    <>
      <PreferredPlatformsViewModal
        opened={modal === "preferredPlatforms"}
        onClose={closeModal}
      />
    </>
  );
};
