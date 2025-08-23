import { ActionIcon, Menu } from "@mantine/core";
import React, { PropsWithChildren } from "react";
import { IconDots } from "@tabler/icons-react";
import { ItemDropdownEditButton } from "#@/components/general/input/ItemDropdown/ItemDropdownEditButton";
import { ItemDropdownRemoveButton } from "#@/components/general/input/ItemDropdown/ItemDropdownRemoveButton";
import { ItemDropdownReportButton } from "#@/components/general/input/ItemDropdown/ItemDropdownReportButton";
import { ItemDropdownShareButton } from "#@/components/general/input/ItemDropdown/ItemDropdownShareButton.tsx";

/**
 * Common component to build dropdown actions for specific components. <br>
 * <strong>Actual logic should be handled by componentes using this.</strong>
 * @param children
 * @constructor
 */
const ItemDropdown = ({ children }: PropsWithChildren) => {
  return (
    <Menu shadow={"md"} width={200} position={"left"}>
      <Menu.Target>
        <ActionIcon variant={"subtle"} c={"white"}>
          <IconDots />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Actions</Menu.Label>
        {children}
      </Menu.Dropdown>
    </Menu>
  );
};

ItemDropdown.EditButton = ItemDropdownEditButton;
ItemDropdown.RemoveButton = ItemDropdownRemoveButton;
ItemDropdown.ReportButton = ItemDropdownReportButton;
ItemDropdown.ShareButton = ItemDropdownShareButton;

export { ItemDropdown };
