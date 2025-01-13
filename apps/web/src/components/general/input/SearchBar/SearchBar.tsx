import React, { useState } from "react";
import { Autocomplete, Button, Group } from "@mantine/core";
import {
    FloatingLabelInput,
    IFloatingLabelInputProps,
} from "@/components/general/input/FloatingLabelInput/FloatingLabelInput";
import { IconSearch } from "@tabler/icons-react";

export interface SearchBarProps extends IFloatingLabelInputProps {
    withButton?: boolean;
}

const SearchBar = ({ withButton, ...props }: SearchBarProps) => {
    return (
        <Group
            wrap={"nowrap"}
            className="w-full"
            justify="center"
            align="start"
            gap={0}
        >
            <FloatingLabelInput
                {...props}
                classNames={{
                    root: "!grow",
                    input: withButton
                        ? "!rounded-tr-none !rounded-br-none"
                        : undefined,
                }}
            />
            {withButton && (
                <Button
                    type="submit"
                    className="!rounded-tl-none !rounded-bl-none"
                >
                    <IconSearch />
                </Button>
            )}
        </Group>
    );
};

export default SearchBar;
