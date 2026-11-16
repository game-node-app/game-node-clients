import { useTranslation } from "@repo/locales";

/** Locale used while the i18n instance has no language yet. */
export const DEFAULT_FORMAT_LOCALE = "en";

/**
 * Locale of the active i18n instance, for the pure formatters in this file.
 * Components should pass it explicitly instead of hardcoding "pt-BR"/"en".
 */
export function useFormatLocale(): string {
  const { i18n } = useTranslation();
  return i18n?.resolvedLanguage || i18n?.language || DEFAULT_FORMAT_LOCALE;
}

/** Playtime in whole hours, rounded to the nearest hour. */
export function toPlaytimeHours(
  seconds: number | null | undefined,
): number | null {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return null;
  }

  return Math.round(seconds / 3600);
}

/** Locale-formatted integer, e.g. "4.812" in pt-BR and "4,812" in en. */
export function formatNumber(
  value: number | null | undefined,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return new Intl.NumberFormat(locale || DEFAULT_FORMAT_LOCALE, options).format(
    value,
  );
}

/** Playtime in whole hours, locale-formatted ("4.812" in pt-BR). */
export function formatPlaytimeHours(
  seconds: number | null | undefined,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string | null {
  return formatNumber(toPlaytimeHours(seconds), locale, options);
}

/** Converts the server's 0–5 rating scale to the displayed 0–10 scale. */
export function toDisplayRating(
  rating: number | null | undefined,
): number | null {
  if (rating === null || rating === undefined || !Number.isFinite(rating)) {
    return null;
  }

  return rating * 2;
}

export interface FormatRatingOptions {
  /**
   * Fraction digits: 1 for "9,0" (Recap and results), 0 for the ballot's
   * "nota 9".
   * @default 1
   */
  maximumFractionDigits?: 0 | 1;
}

/**
 * Rating on the 0–10 scale with the locale separator ("9,0" in pt-BR,
 * "9.0" in en). A null rating means "not rated": it returns null instead of
 * zero so callers can omit the label.
 */
export function formatRating(
  rating: number | null | undefined,
  locale: string,
  options: FormatRatingOptions = {},
): string | null {
  const displayRating = toDisplayRating(rating);
  if (displayRating === null) {
    return null;
  }

  const digits = options.maximumFractionDigits ?? 1;

  return new Intl.NumberFormat(locale || DEFAULT_FORMAT_LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(displayRating);
}

/** Rating without decimals, as the ballot shows it ("nota 9"). */
export function formatRatingCompact(
  rating: number | null | undefined,
  locale: string,
): string | null {
  return formatRating(rating, locale, { maximumFractionDigits: 0 });
}

export interface FormatPercentageOptions {
  /** @default 0 */
  maximumFractionDigits?: number;
  /** @default 0 */
  minimumFractionDigits?: number;
}

/** Formats a 0–1 fraction as a percentage ("31%" in both pt-BR and en). */
export function formatPercentage(
  fraction: number | null | undefined,
  locale: string,
  options: FormatPercentageOptions = {},
): string | null {
  if (
    fraction === null ||
    fraction === undefined ||
    !Number.isFinite(fraction)
  ) {
    return null;
  }

  return new Intl.NumberFormat(locale || DEFAULT_FORMAT_LOCALE, {
    style: "percent",
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(fraction);
}

/**
 * Formats an instant in UTC, regardless of the viewer's time zone. Awards
 * dates end at 23:59:59Z, so a local-time formatter would move them to the
 * next day in UTC-x (or the previous day for a midnight start in UTC+x).
 *
 * Defaults to the short day/month used in the event timeline ("3 de nov." in
 * pt-BR, "Nov 3" in en).
 */
export function formatUtcDate(
  value: string | Date | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale || DEFAULT_FORMAT_LOCALE, {
    ...options,
    timeZone: "UTC",
  }).format(date);
}
