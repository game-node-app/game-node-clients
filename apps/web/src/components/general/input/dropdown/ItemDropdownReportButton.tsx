import React from "react";
import { IconBan } from "@tabler/icons-react";
import { Menu } from "@mantine/core";
import { ItemDropdownButtonProps } from "@/components/general/input/dropdown/types";

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

export default ItemDropdownReportButton;
