import { ItemDropdownButtonProps } from "#@/components/general/input/ItemDropdown/types";
import { Menu } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconEdit } from "@tabler/icons-react";

export type ItemDropdownEditButtonProps = ItemDropdownButtonProps;

const ItemDropdownEditButton = ({
  onClick,
  disabled = false,
}: ItemDropdownEditButtonProps) => {
  const { t } = useTranslation();
  return (
    <Menu.Item
      onClick={onClick}
      leftSection={<IconEdit size={"1rem"} />}
      disabled={disabled}
    >
      {t("actions.edit")}
    </Menu.Item>
  );
};

export { ItemDropdownEditButton };
