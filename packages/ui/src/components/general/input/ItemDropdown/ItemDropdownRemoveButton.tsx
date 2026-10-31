import { ItemDropdownButtonProps } from "#@/components/general/input/ItemDropdown/types";
import { Menu } from "@mantine/core";
import { IconTrashOff } from "@tabler/icons-react";

export type ItemDropdownRemoveButtonProps = ItemDropdownButtonProps;

const ItemDropdownRemoveButton = ({
  onClick,
  disabled,
}: ItemDropdownRemoveButtonProps) => {
  return (
    <Menu.Item
      c={"red"}
      onClick={onClick}
      leftSection={<IconTrashOff size={"1rem"} />}
      disabled={disabled}
    >
      Remove
    </Menu.Item>
  );
};

export { ItemDropdownRemoveButton };