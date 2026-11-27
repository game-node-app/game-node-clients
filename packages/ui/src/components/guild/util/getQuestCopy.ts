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

/**
 * Procedural `meta` values of a board quest (`GuildBoardQuestMetaDto`). The
 * legacy `sinceYear`/`estimatedHours` chips stay on the candidate games; these
 * are the extra captions of design D6.
 */
export interface GuildQuestMetaSource {
  genreName?: string | null;
  franchiseName?: string | null;
  themeName?: string | null;
  decade?: string | null;
  staleDays?: number | null;
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
 * Chain stage contracts carry a `templateKey` shaped `<chainKey>:<stageKey>`
 * (e.g. `pathfinders_arc:trail_head`). Their copy lives under the stage keys,
 * and the colon must never reach i18next where it separates namespaces.
 */
function getChainStageCopy(
  templateKey: string,
  t: TFunction,
): GuildQuestCopy | null {
  const separatorIndex = templateKey.indexOf(":");
  if (separatorIndex < 0) return null;

  const stageKey = templateKey.slice(separatorIndex + 1);
  if (!stageKey) return null;

  const titleKey = `guild.chains.stages.${stageKey}.title`;
  const objectiveKey = `guild.chains.stages.${stageKey}.objective`;
  // Server data: a stray `:` must never be read as a namespace separator.
  const title = translate(t, titleKey, { nsSeparator: false });
  const objective = translate(t, objectiveKey, { nsSeparator: false });

  return {
    title: title === titleKey ? humanizeKey(stageKey) : title,
    description: objective === objectiveKey ? "" : objective,
  };
}

/**
 * Resolves the quest card copy:
 * - chain stage contracts (`<chainKey>:<stageKey>`) come from
 *   `guild.chains.stages.<stageKey>.*`;
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
    const stageCopy = getChainStageCopy(quest.templateKey, t);
    if (stageCopy) return stageCopy;

    const titleKey = `guild.templates.${quest.templateKey}.title`;
    const descriptionKey = `guild.templates.${quest.templateKey}.description`;
    const title = translate(t, titleKey, { nsSeparator: false });

    if (title !== titleKey) {
      const description = translate(t, descriptionKey, {
        nsSeparator: false,
      });
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

function pushCaption(
  captions: string[],
  t: TFunction,
  key: string,
  options: Record<string, unknown>,
): void {
  const translated = translate(t, key, options);

  if (translated !== key) {
    captions.push(translated);
  }
}

/**
 * Localizes the procedural meta captions of design D6 ("Genre: Metroidvania",
 * "Untouched for 412 days"). Empty or unknown values are skipped so the card
 * only shows what the server actually sent.
 */
export function getQuestMetaCaptions(
  meta: GuildQuestMetaSource | null | undefined,
  t: TFunction,
): string[] {
  if (!meta) return [];

  const captions: string[] = [];

  if (meta.genreName) {
    pushCaption(captions, t, "guild.board.meta.genre", {
      genre: meta.genreName,
    });
  }

  if (meta.franchiseName) {
    pushCaption(captions, t, "guild.board.meta.franchise", {
      franchise: meta.franchiseName,
    });
  }

  if (meta.themeName) {
    pushCaption(captions, t, "guild.board.meta.theme", {
      theme: meta.themeName,
    });
  }

  if (meta.decade) {
    pushCaption(captions, t, "guild.board.meta.decade", {
      decade: meta.decade,
    });
  }

  if (meta.staleDays != null) {
    pushCaption(captions, t, "guild.board.meta.staleDays", {
      days: meta.staleDays,
    });
  }

  return captions;
}
