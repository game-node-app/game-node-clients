import React from "react";
import { ItemDropdownButtonProps } from "@/components/general/input/dropdown/types";
import { IconTrashOff } from "@tabler/icons-react";
import { Menu } from "@mantine/core";

interface Props extends ItemDropdownButtonProps {}

const ItemDropdownRemoveButton = ({ onClick, disabled }: Props) => {
    return (
        <Menu.Item
            c={"red"}
            onClick={onClick}
            leftSection={<IconTrashOff size={"1rem"} />}
            disabled={disabled}
        >
            Remove
        </Menu.Item>
    );
};

export default ItemDropdownRemoveButton;
