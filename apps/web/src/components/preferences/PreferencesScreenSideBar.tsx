import React from "react";
import { Box, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export type PreferencesActiveCategory = "connections" | "privacy";

interface PreferencesCategory {
    name: string;
    activeCategoryName: PreferencesActiveCategory;
}

interface Props {
    activeItem: PreferencesActiveCategory;
    onChange: (activeCategory: PreferencesActiveCategory) => void;
}

export const PREFERENCES_SCREEN_CATEGORIES: PreferencesCategory[] = [
    {
        name: "Connections",
        activeCategoryName: "connections",
    },
    // {
    //     name: "Privacy",
    //     activeCategoryName: "privacy",
    // },
];

const PreferencesScreenSideBar = ({ activeItem, onChange }: Props) => {
    const itemsElements = PREFERENCES_SCREEN_CATEGORIES.map((item) => {
        const isActiveItem = item.activeCategoryName === activeItem;
        return (
            <Link
                key={item.activeCategoryName}
                href={``}
                onClick={(evt) => {
                    evt.preventDefault();
                    onChange(item.activeCategoryName);
                }}
            >
                <Box
                    className={`w-full flex justify-center items-center h-12 ${isActiveItem ? "bg-brand-5" : undefined}`}
                >
                    <Text fz={"1.3rem"} fw={"bold"}>
                        {item.name}
                    </Text>
                </Box>
            </Link>
        );
    });

    return (
        <Stack gap={0} className={"w-full h-96 justify-between"}>
            <Stack gap={0} className={"w-full"}>
                {itemsElements}
            </Stack>
            <Stack className={"w-full items-center"}>
                <Link href={"/about"}>
                    <Text c={"dimmed"}>Report a bug </Text>
                </Link>
                <Link href={"/auth/logout"}>
                    <Text c={"dimmed"}>Sign out</Text>
                </Link>
            </Stack>
        </Stack>
    );
};

export default PreferencesScreenSideBar;
