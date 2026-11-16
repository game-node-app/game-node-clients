import { AwardsCategoryTranslationDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";

/**
 * Awards category text resolved for one interface language (design decision 1
 * of `localize-awards-category-content`).
 *
 * The base `name` and `description` are the fallback. A locale entry is used
 * only when both of its fields are filled, so the pair always comes from a
 * single source and a translation is never mixed with base text.
 */

export interface AwardsCategoryTextSource {
  name: string;
  description: string;
  translations?: AwardsCategoryTranslationDto[] | null;
}

export interface AwardsCategoryText {
  name: string;
  description: string;
}

/** `pt`, `pt-BR`, `pt-PT`, … resolve to `pt-BR`; everything else resolves to `en`. */
function normalizeLocale(
  language: string,
): AwardsCategoryTranslationDto.locale {
  const normalized = language.trim().toLowerCase();

  return normalized === "pt-br" || normalized.startsWith("pt")
    ? AwardsCategoryTranslationDto.locale.PT_BR
    : AwardsCategoryTranslationDto.locale.EN;
}

function isFilled(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveAwardsCategoryText(
  category: AwardsCategoryTextSource,
  language: string,
): AwardsCategoryText {
  const locale = normalizeLocale(language);
  const translation = category.translations?.find(
    (entry) => entry.locale === locale,
  );

  if (
    translation &&
    isFilled(translation.name) &&
    isFilled(translation.description)
  ) {
    return {
      name: translation.name,
      description: translation.description,
    };
  }

  return {
    name: category.name,
    description: category.description,
  };
}

/**
 * Resolver bound to the current interface language. `useTranslation`
 * subscribes the caller to language changes, so switching language re-renders
 * the Awards screens and re-resolves from cached data without a refetch.
 */
export function useAwardsCategoryText(): (
  category: AwardsCategoryTextSource,
) => AwardsCategoryText {
  const { i18n } = useTranslation();
  const language = i18n?.resolvedLanguage || i18n?.language || "";

  return (category) => resolveAwardsCategoryText(category, language);
}
