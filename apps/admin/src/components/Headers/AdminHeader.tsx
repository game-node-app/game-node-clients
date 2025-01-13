"use client";

import { Box, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import classes from "./AdminHeader.module.css";
import GameNodeLogo from "@/components/general/GameNodeLogo";

interface Props {
    burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
    return (
        <header className={classes.header}>
            {burger && burger}
            <GameNodeLogo className="w-28 h-auto max-h-full" />
            <Box style={{ flex: 1 }} />
            <TextInput
                placeholder="Search"
                variant="filled"
                leftSection={<IconSearch size="0.8rem" />}
                style={{}}
                disabled
            />
        </header>
    );
}
