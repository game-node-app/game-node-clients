// Type augmentation for react-i18next (must be imported for types to work)
import "./types/i18next";

// Context and hooks
export {
  I18nProvider,
  useI18nContext,
  useTranslation,
  type I18nProviderProps,
} from "./context";

// i18n utilities
export {
  createI18nInstance,
  getInitialLanguage,
  getStoredLanguage,
  setStoredLanguage,
  detectBrowserLanguage,
  resources,
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  SUPPORTED_LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  type I18nConfig,
  type SupportedLanguage,
} from "./i18n";

// Translations (for type inference and direct access if needed)
export { en, ptBR, type TranslationSchema } from "./translations";
