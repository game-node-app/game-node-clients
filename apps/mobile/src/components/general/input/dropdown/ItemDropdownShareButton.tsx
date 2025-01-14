import React from "react";
import { ItemDropdownButtonProps } from "@/components/general/input/dropdown/types";
import { IconShare } from "@tabler/icons-react";
import { Menu } from "@mantine/core";

const ItemDropdownShareButton = ({ onClick, disabled }: ItemDropdownButtonProps) => {
    return (
        <Menu.Item onClick={onClick} leftSection={<IconShare size={"1rem"} />} disabled={disabled}>
            Share
        </Menu.Item>
    );
};

export default ItemDropdownShareButton;
