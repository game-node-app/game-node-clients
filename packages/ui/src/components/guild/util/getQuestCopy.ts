import type { TFunction } from "i18next";

/**
 * The copy of a board quest or contract, already localized.
 */
export interface GuildQuestCopy {
  title: string;
  description: string;
}

interface GuildEventTranslation {
  locale: string;
  title: string;
  description: string;
}

interface GuildEventCopySource {
  title: string;
  description: string;
  translations: GuildEventTranslation[];
}

/**
 * Structural shape shared by `GuildBoardQuestDto` and `GuildContractDto`
 * (which carries its event summary under `event`).
 */
export interface GuildQuestCopySource {
  templateKey: string | null;
  title?: string | null;
  description?: string | null;
  translations?: GuildEventTranslation[] | null;
  event?: GuildEventCopySource | null;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
) {
  return (t as unknown as Translate)(key, options);
}

function normalizeLocale(locale: string): "en" | "pt-BR" {
  return locale.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

function humanizeKey(key: string): string {
  return key.replace(/[_-]+/g, " ").trim();
}

function getEventCopy(
  quest: GuildQuestCopySource,
  locale: string,
): GuildQuestCopy | null {
  const translations = quest.translations ?? quest.event?.translations ?? [];
  if (translations.length > 0) {
    const normalizedLocale = normalizeLocale(locale);
    const match = translations.find(
      (translation) => translation.locale === normalizedLocale,
    );
    if (match) {
      return { title: match.title, description: match.description };
    }
  }

  const title = quest.title ?? quest.event?.title;
  const description = quest.description ?? quest.event?.description;
  if (title || description) {
    return { title: title ?? "", description: description ?? "" };
  }

  return null;
}

/**
 * Resolves the quest card copy:
 * - system board entries come from `guild.templates.<key>.*`;
 * - curated events use the translation matching the current locale, then the
 *   base `title`/`description` from the server;
 * - unknown template keys degrade to a humanized key instead of disappearing.
 */
export function getQuestCopy(
  quest: GuildQuestCopySource,
  t: TFunction,
  locale: string,
): GuildQuestCopy {
  if (quest.templateKey) {
    const titleKey = `guild.templates.${quest.templateKey}.title`;
    const descriptionKey = `guild.templates.${quest.templateKey}.description`;
    const title = translate(t, titleKey);

    if (title !== titleKey) {
      const description = translate(t, descriptionKey);
      return {
        title,
        description: description === descriptionKey ? "" : description,
      };
    }
  }

  const eventCopy = getEventCopy(quest, locale);
  if (eventCopy) return eventCopy;

  if (quest.templateKey) {
    return { title: humanizeKey(quest.templateKey), description: "" };
  }

  return { title: "", description: "" };
}
