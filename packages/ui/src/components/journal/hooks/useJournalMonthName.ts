import { useTranslation } from "@repo/locales";

/**
 * Localised full month name ("March" / "março"). `month` is zero-based.
 * Uses `Intl` with the active i18n language: dayjs would need a locale
 * loaded per language, and no app sets one.
 */
export function useJournalMonthName(year: number, month: number): string {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;

  return new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(year, month, 1),
  );
}
