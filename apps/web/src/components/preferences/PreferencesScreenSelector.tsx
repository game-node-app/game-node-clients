import React from "react";
import { ComboboxItem, Select } from "@mantine/core";
import {
    PreferencesActiveCategory,
    PREFERENCES_SCREEN_CATEGORIES,
} from "@/components/preferences/PreferencesScreenSideBar";

interface Props {
    activeCategory: PreferencesActiveCategory;
    onChange: (item: PreferencesActiveCategory) => void;
}

const PreferencesScreenSelector = ({ activeCategory, onChange }: Props) => {
    const data = PREFERENCES_SCREEN_CATEGORIES.map((item): ComboboxItem => {
        return {
            label: item.name,
            value: item.activeCategoryName,
        };
    });
    return (
        <Select
            className={"w-full"}
            data={data}
            value={activeCategory}
            onChange={(item) => onChange(item as PreferencesActiveCategory)}
            allowDeselect={false}
        />
    );
};

export default PreferencesScreenSelector;
