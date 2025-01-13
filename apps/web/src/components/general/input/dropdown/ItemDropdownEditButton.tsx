import React from "react";
import { IconEdit } from "@tabler/icons-react";
import { Menu } from "@mantine/core";
import { ItemDropdownButtonProps } from "@/components/general/input/dropdown/types";

interface Props extends ItemDropdownButtonProps {}

const ItemDropdownEditButton = ({ onClick, disabled = false }: Props) => {
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

export default ItemDropdownEditButton;
