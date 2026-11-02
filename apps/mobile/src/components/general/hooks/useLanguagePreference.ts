import { useCallback, useEffect, useState } from "react";
import { getInitialLanguage, SupportedLanguage } from "@repo/locales";
import { Preferences } from "@capacitor/preferences";

const LANGUAGE_PREF_KEY = "gamenode-language";

type UseLanguagePreferenceResult = [
  SupportedLanguage,
  (lang: SupportedLanguage) => void,
];

export function useLanguagePreference(): UseLanguagePreferenceResult {
  const [language, setInternalLanguage] = useState<SupportedLanguage>(
    getInitialLanguage,
  );

  // Async Preferences value covers installs that predate the localStorage mirror.
  useEffect(() => {
    (async () => {
      const languagePreference = await Preferences.get({
        key: LANGUAGE_PREF_KEY,
      });

      if (languagePreference.value == null) {
        return;
      }

      setInternalLanguage(languagePreference.value as never);
    })();
  }, []);

  const onLanguageChange = useCallback((lang: SupportedLanguage) => {
    setInternalLanguage(lang);
    Preferences.set({
      key: LANGUAGE_PREF_KEY,
      value: lang,
    });
  }, []);

  return [language, onLanguageChange];
}
