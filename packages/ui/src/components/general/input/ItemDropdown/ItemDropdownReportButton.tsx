import { ItemDropdownButtonProps } from "#@/components/general/input/ItemDropdown/types";
import { Menu } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconBan } from "@tabler/icons-react";

const ItemDropdownReportButton = ({
  disabled,
  onClick,
}: ItemDropdownButtonProps) => {
  const { t } = useTranslation();
  return (
    <Menu.Item
      c={"red"}
      leftSection={<IconBan size={"1rem"} />}
      disabled={disabled}
      onClick={onClick}
    >
      {t("actions.report")}
    </Menu.Item>
  );
};

export { ItemDropdownReportButton };
