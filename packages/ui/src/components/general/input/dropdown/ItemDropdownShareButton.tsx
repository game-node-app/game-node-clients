import React from "react";
import { IconShare } from "@tabler/icons-react";
import { Menu } from "@mantine/core";
import { ItemDropdownButtonProps } from "#@/components";

const ItemDropdownShareButton = ({
  onClick,
  disabled,
}: ItemDropdownButtonProps) => {
  return (
    <Menu.Item
      onClick={onClick}
      leftSection={<IconShare size={"1rem"} />}
      disabled={disabled}
    >
      Share
    </Menu.Item>
  );
};

export { ItemDropdownShareButton };
