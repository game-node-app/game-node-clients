import { ItemDropdownButtonProps } from "#@/components/general/input/ItemDropdown/types";
import { Menu } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconTrashOff } from "@tabler/icons-react";

export type ItemDropdownRemoveButtonProps = ItemDropdownButtonProps;

const ItemDropdownRemoveButton = ({
  onClick,
  disabled,
}: ItemDropdownRemoveButtonProps) => {
  const { t } = useTranslation();
  return (
    <Menu.Item
      c={"red"}
      onClick={onClick}
      leftSection={<IconTrashOff size={"1rem"} />}
      disabled={disabled}
    >
      {t("actions.remove")}
    </Menu.Item>
  );
};

export { ItemDropdownRemoveButton };
