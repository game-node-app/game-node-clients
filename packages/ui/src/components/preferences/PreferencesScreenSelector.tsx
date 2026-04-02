import React from "react";
import { ComboboxItem, Select } from "@mantine/core";
import { PreferencesActiveCategory } from "#@/components/preferences/PreferencesScreenSideBar";
import { useTranslation } from "@repo/locales";

interface Props {
  activeCategory: PreferencesActiveCategory;
  onChange: (item: PreferencesActiveCategory) => void;
}

const PreferencesScreenSelector = ({ activeCategory, onChange }: Props) => {
  const { t } = useTranslation();

  const data: ComboboxItem[] = [
    {
      label: t("preferences.categories.connections"),
      value: "connections",
    },
    {
      label: t("preferences.categories.account"),
      value: "account",
    },
    {
      label: t("preferences.categories.library"),
      value: "library",
    },
  ];

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

export { PreferencesScreenSelector };
