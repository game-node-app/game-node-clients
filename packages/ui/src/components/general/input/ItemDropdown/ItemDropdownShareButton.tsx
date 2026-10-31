import { ItemDropdownButtonProps } from "#@/components";
import { Menu } from "@mantine/core";
import { IconShare } from "@tabler/icons-react";

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