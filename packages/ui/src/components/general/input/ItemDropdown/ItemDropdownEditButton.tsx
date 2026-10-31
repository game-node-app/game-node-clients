import { ItemDropdownButtonProps } from "#@/components/general/input/ItemDropdown/types";
import { Menu } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";

export type ItemDropdownEditButtonProps = ItemDropdownButtonProps;

const ItemDropdownEditButton = ({
  onClick,
  disabled = false,
}: ItemDropdownEditButtonProps) => {
  return (
    <Menu.Item
      onClick={onClick}
      leftSection={<IconEdit size={"1rem"} />}
      disabled={disabled}
    >
      Edit
    </Menu.Item>
  );
};

export { ItemDropdownEditButton };
