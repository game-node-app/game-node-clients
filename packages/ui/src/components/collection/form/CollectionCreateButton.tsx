import { CollectionCreateOrUpdateModal } from "#@/components/collection/form/modal/CollectionCreateOrUpdateModal";
import { Button, ButtonProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconPlus } from "@tabler/icons-react";
import { Collection } from "@repo/wrapper/server";
import { ReactNode } from "react";

interface Props extends Omit<ButtonProps, "children"> {
  /**
   * Button label. Defaults to "New collection".
   */
  children?: ReactNode;
  /**
   * Called after the collection is created.
   */
  onCreated?: (collection: Collection) => void;
}

/**
 * A button that opens the collection creation modal.
 * Owns the modal state, so it can be dropped anywhere the user should be able
 * to create a collection.
 */
const CollectionCreateButton = ({ children, onCreated, ...others }: Props) => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <CollectionCreateOrUpdateModal
        collectionId={undefined}
        opened={opened}
        onClose={close}
        onCreated={onCreated}
      />
      <Button
        type="button"
        leftSection={<IconPlus size={16} />}
        onClick={open}
        {...others}
      >
        {children ?? t("collection.actions.create")}
      </Button>
    </>
  );
};

export { CollectionCreateButton };
