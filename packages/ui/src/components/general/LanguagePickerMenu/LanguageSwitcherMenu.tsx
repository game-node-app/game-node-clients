import React, { useState } from "react";
import { Menu, Text, UnstyledButton } from "@mantine/core";
import { SupportedLanguage, useI18nContext } from "@repo/locales";
import { IconChevronDown, IconLanguage } from "@tabler/icons-react";

const LANGUAGE_OPTIONS: {
  value: SupportedLanguage;
  label: string;
}[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
];

/**
 * A dropdown component for switching the application language.
 * Uses the I18nProvider context to change and persist the language.
 */
const LanguageSwitcherMenu = () => {
  const { language, setLanguage } = useI18nContext();

  const [opened, setOpened] = useState(false);

  const selected =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ||
    LANGUAGE_OPTIONS[0];

  const items = LANGUAGE_OPTIONS.map((item) => (
    <Menu.Item onClick={() => setLanguage(item.value)} key={item.label}>
      {item.label}
    </Menu.Item>
  ));

  return (
    <Menu
      onOpen={() => setOpened(true)}
      onClose={() => setOpened(false)}
      radius="md"
      width="target"
      withinPortal={false}
      offset={12}
    >
      <Menu.Target>
        <UnstyledButton
          className={
            "h-9 w-full items-center gap-2.5 flex flex-nowrap ps-4 rounded  hover:bg-paper-8 data-[active]:bg-paper-8"
          }
          data-active={opened || undefined}
        >
          <IconLanguage size={20} />
          <Text className={"text-[#E3E3E3]"}>{selected.label}</Text>
          <IconChevronDown className={"ms-auto me-1"} size={20} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>{items}</Menu.Dropdown>
    </Menu>
  );
};

export { LanguageSwitcherMenu };
