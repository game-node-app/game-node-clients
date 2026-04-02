import React, { useState } from "react";
import {
  Group,
  Menu,
  Select,
  SelectProps,
  UnstyledButton,
  Text,
} from "@mantine/core";
import {
  useI18nContext,
  useTranslation,
  SupportedLanguage,
} from "@repo/locales";
import classes from "./LanguageSwitcherMenu.module.css";
import { IconChevronDown } from "@tabler/icons-react";

type LanguageSwitcherProps = Omit<
  SelectProps,
  "label" | "onChange" | "value" | "allowDeselect" | "data"
>;

const LANGUAGE_OPTIONS: {
  value: SupportedLanguage;
  label: string;
  flag: string;
}[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
];

/**
 * A dropdown component for switching the application language.
 * Uses the I18nProvider context to change and persist the language.
 */
const LanguageSwitcherMenu = (props: LanguageSwitcherProps) => {
  const { language, setLanguage } = useI18nContext();

  const [opened, setOpened] = useState(false);

  const selected =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ||
    LANGUAGE_OPTIONS[0];

  const items = LANGUAGE_OPTIONS.map((item) => (
    <Menu.Item
      leftSection={item.flag}
      onClick={() => setLanguage(item.value)}
      key={item.label}
    >
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
    >
      <Menu.Target>
        <UnstyledButton
          className={classes.control}
          data-expanded={opened || undefined}
        >
          <Group gap="xs">
            <Text>{selected.flag}</Text>
            <span className={classes.label}>{selected.label}</span>
          </Group>
          <IconChevronDown size={16} className={classes.icon} stroke={1.5} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>{items}</Menu.Dropdown>
    </Menu>
  );
};

export { LanguageSwitcherMenu };
