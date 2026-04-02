import React from "react";
import { Select } from "@mantine/core";
import {
  useI18nContext,
  useTranslation,
  SupportedLanguage,
} from "@repo/locales";

interface LanguageSwitcherProps {
  /**
   * Optional label for the select. Defaults to translated "Language" label.
   */
  label?: string;
  /**
   * Optional className for styling.
   */
  className?: string;
}

const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
];

/**
 * A dropdown component for switching the application language.
 * Uses the I18nProvider context to change and persist the language.
 */
const LanguageSwitcher = ({ label, className }: LanguageSwitcherProps) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useI18nContext();

  return (
    <Select
      label={label ?? t("language.label")}
      value={language}
      onChange={(value) => {
        if (value) {
          const nextLanguage = value as SupportedLanguage;
          setLanguage(nextLanguage);
        }
      }}
      data={LANGUAGE_OPTIONS}
      className={className}
      allowDeselect={false}
    />
  );
};

export { LanguageSwitcher };
