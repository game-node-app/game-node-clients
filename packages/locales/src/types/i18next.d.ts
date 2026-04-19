/**
 * Type augmentation for react-i18next.
 * This makes the useTranslation hook fully type-safe by declaring
 * our translation resources and default namespace.
 *
 * With this augmentation:
 * - t("actions.cancel") ✓ (autocompletes and type-checks)
 * - t("actions.typo") ✗ (TypeScript error)
 * - t("actions.cancel", { count: 5 }) - Parameter validation
 */

import "i18next";
import type { TranslationSchema } from "../generated/translation-schema";

declare module "i18next" {
  interface CustomTypeOptions {
    /**
     * Default namespace used when no namespace is specified.
     */
    defaultNS: "common";
    /**
     * Resources type based on our English translations.
     * English is the source of truth for all translation keys.
     */
    resources: {
      common: TranslationSchema;
    };
    /**
     * Return type is not nullable - we always have a fallback.
     */
    returnNull: false;
  }
}
