import { createContext, useContext, useMemo, ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { i18n as I18nInstance } from "i18next";
import {
  createI18nInstance,
  getInitialLanguage,
  I18nConfig,
  setStoredLanguage,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from "#@/i18n";

interface I18nContextValue {
  i18n: I18nInstance;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  supportedLanguages: readonly SupportedLanguage[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps extends I18nConfig {
  children: ReactNode;
}

/**
 * I18n provider that wraps the app with i18next context.
 * All translations are centralized in @repo/locales.
 * Should be placed near the root of the component tree.
 *
 * @example
 * ```tsx
 * // In apps/web/_app.tsx or apps/mobile/App.tsx
 * import { I18nProvider } from "@repo/locales";
 *
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({ children, ...config }: I18nProviderProps) {
  const i18n = useMemo(() => {
    const initialLanguage = config.language || getInitialLanguage();
    return createI18nInstance({
      ...config,
      language: initialLanguage,
    });
  }, [config]);

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      i18n,
      language: i18n.language as SupportedLanguage,
      setLanguage: (lang: SupportedLanguage) => {
        i18n.changeLanguage(lang);
        setStoredLanguage(lang);
      },
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [i18n],
  );

  return (
    <I18nContext.Provider value={contextValue}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </I18nContext.Provider>
  );
}

/**
 * Hook to access i18n context with language switching capabilities.
 */
export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18nContext must be used within an I18nProvider");
  }
  return context;
}

/**
 * Re-export useTranslation for convenience.
 * Components can import directly from @repo/locales instead of react-i18next.
 */
export { useTranslation };
