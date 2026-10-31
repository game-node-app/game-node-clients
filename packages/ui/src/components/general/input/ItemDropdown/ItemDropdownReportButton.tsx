import { ItemDropdownButtonProps } from "#@/components/general/input/ItemDropdown/types";
import { Menu } from "@mantine/core";
import { IconBan } from "@tabler/icons-react";

const ItemDropdownReportButton = ({
  disabled,
  onClick,
}: ItemDropdownButtonProps) => {
  return (
    <Menu.Item
      c={"red"}
      leftSection={<IconBan size={"1rem"} />}
      disabled={disabled}
      onClick={onClick}
    >
      Report
    </Menu.Item>
  );
};

export { ItemDropdownReportButton };