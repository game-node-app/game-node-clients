import i18n, { InitOptions, i18n as I18nInstance, Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "#@/translations/en";
import { ptBR } from "#@/translations/pt-BR";

export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "pt-BR"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_NAMESPACE = "common";

/**
 * All translations bundled with @repo/locales.
 * Single source of truth for all translations across apps.
 */
export const resources: Resource = {
  en: {
    [DEFAULT_NAMESPACE]: en,
  },
  "pt-BR": {
    [DEFAULT_NAMESPACE]: ptBR,
  },
};

export interface I18nConfig {
  /**
   * Initial language. Defaults to browser detection or 'en'.
   */
  language?: SupportedLanguage;
  /**
   * Default namespace for translations.
   */
  defaultNS?: string;
  /**
   * Enable debug mode for i18next.
   */
  debug?: boolean;
}

/**
 * Creates and initializes an i18next instance.
 * Should be called once at app startup.
 */
export function createI18nInstance(config: I18nConfig = {}): I18nInstance {
  const { language, defaultNS = DEFAULT_NAMESPACE, debug = false } = config;

  const options: InitOptions = {
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS,
    ns: Object.keys((resources[DEFAULT_LANGUAGE] as object) || {}),
    interpolation: {
      escapeValue: false, // React already escapes
    },
    debug,
    react: {
      useSuspense: false, // Avoid SSR issues
    },
  };

  const instance = i18n.createInstance();
  instance.use(initReactI18next).init(options);

  return instance;
}

/**
 * Storage key for persisted language preference.
 */
export const LANGUAGE_STORAGE_KEY = "gamenode-language";

/**
 * Gets the stored language preference.
 */
export function getStoredLanguage(): SupportedLanguage | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }
  return getLanguageFromCookie(document.cookie);
}

/**
 * Stores language preference.
 */
export function setStoredLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${encodeURIComponent(
    language,
  )}; path=/; max-age=31536000; SameSite=Lax`;
}

function normalizeLanguage(language: string): SupportedLanguage | null {
  if (SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }

  const langPrefix = language.split("-")[0];
  const match = SUPPORTED_LANGUAGES.find((lang) =>
    lang.startsWith(langPrefix + "-"),
  );
  if (match) return match;

  if (SUPPORTED_LANGUAGES.includes(langPrefix as SupportedLanguage)) {
    return langPrefix as SupportedLanguage;
  }

  return null;
}

function getLanguageFromCookie(
  cookieHeader?: string,
): SupportedLanguage | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const target = cookies.find((cookie) =>
    cookie.startsWith(`${LANGUAGE_STORAGE_KEY}=`),
  );
  if (!target) return null;

  const value = target.split("=").slice(1).join("=");
  const decodedValue = decodeURIComponent(value);
  return normalizeLanguage(decodedValue);
}

function getLanguageFromAcceptLanguage(
  acceptLanguage?: string | string[],
): SupportedLanguage | null {
  if (!acceptLanguage) return null;

  const headerValue = Array.isArray(acceptLanguage)
    ? acceptLanguage.join(",")
    : acceptLanguage;

  const parts = headerValue
    .split(",")
    .map((part) => part.trim())
    .map((part) => part.split(";")[0]);

  for (const part of parts) {
    const normalized = normalizeLanguage(part);
    if (normalized) return normalized;
  }

  return null;
}

/**
 * Detects user's preferred language from browser settings.
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const browserLang = navigator.language;
  return normalizeLanguage(browserLang) || DEFAULT_LANGUAGE;
}

/**
 * Gets initial language: stored preference > browser detection > default.
 */
export function getInitialLanguage(): SupportedLanguage {
  return getStoredLanguage() || detectBrowserLanguage();
}

export function getInitialLanguageFromRequest(source: {
  cookie?: string;
  acceptLanguage?: string | string[];
}): SupportedLanguage {
  return (
    getLanguageFromCookie(source.cookie) ||
    getLanguageFromAcceptLanguage(source.acceptLanguage) ||
    DEFAULT_LANGUAGE
  );
}
