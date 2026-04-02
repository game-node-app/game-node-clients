import React from "react";
import { Select, SelectProps } from "@mantine/core";
import {
  useI18nContext,
  useTranslation,
  SupportedLanguage,
} from "@repo/locales";

type LanguageSwitcherProps = Omit<
  SelectProps,
  "label" | "onChange" | "value" | "allowDeselect" | "data"
>;

const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
];

/**
 * A dropdown component for switching the application language.
 * Uses the I18nProvider context to change and persist the language.
 */
const LanguageSwitcher = (props: LanguageSwitcherProps) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useI18nContext();

  return (
    <Select
      {...props}
      label={t("language.label")}
      value={language}
      onChange={(value) => {
        if (value) {
          const nextLanguage = value as SupportedLanguage;
          setLanguage(nextLanguage);
        }
      }}
      data={LANGUAGE_OPTIONS}
      allowDeselect={false}
    />
  );
};

export { LanguageSwitcher };
