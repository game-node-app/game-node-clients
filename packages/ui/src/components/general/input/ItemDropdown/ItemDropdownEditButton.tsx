import React from "react";
import { IconEdit } from "@tabler/icons-react";
import { Menu } from "@mantine/core";
import { ItemDropdownButtonProps } from "#@/components/general/input/ItemDropdown/types";

export interface ItemDropdownEditButtonProps extends ItemDropdownButtonProps {}

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
