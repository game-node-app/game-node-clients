import { ActionIcon, Menu } from "@mantine/core";
import React, { PropsWithChildren, useState } from "react";
import { IconDots } from "@tabler/icons-react";
import ItemDropdownEditButton from "@/components/general/input/dropdown/ItemDropdownEditButton";
import ItemDropdownRemoveButton from "@/components/general/input/dropdown/ItemDropdownRemoveButton";
import ItemDropdownReportButton from "@/components/general/input/dropdown/ItemDropdownReportButton";

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

export default ItemDropdown;
