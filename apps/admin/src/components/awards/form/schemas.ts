import { z } from "zod";
import type { AwardsCategoryTranslationInputDto } from "@repo/wrapper/server";

/**
 * Mirrors the server rules in `AwardsAdminService.assertValidEventDates`:
 * the nomination dates are optional, but must be informed together, start
 * before end and end at or before the voting start.
 */
export const createUpdateAwardsEventSchema = z
  .object({
    year: z.number(),
    votingStartDate: z.date(),
    votingEndDate: z.date(),
    resultsDate: z.date(),
    nominationStartDate: z.date().nullable(),
    nominationEndDate: z.date().nullable(),
    eligibilityCutoffDate: z.date().nullable(),
  })
  .superRefine((values, ctx) => {
    const { nominationStartDate, nominationEndDate } = values;

    if ((nominationStartDate == null) !== (nominationEndDate == null)) {
      ctx.addIssue({
        code: "custom",
        path: [
          nominationStartDate == null
            ? "nominationStartDate"
            : "nominationEndDate",
        ],
        message: "Nomination start and end dates must be informed together.",
      });
      return;
    }

    if (nominationStartDate == null || nominationEndDate == null) return;

    if (nominationStartDate >= nominationEndDate) {
      ctx.addIssue({
        code: "custom",
        path: ["nominationEndDate"],
        message:
          "Nomination start date must be before the nomination end date.",
      });
    }

    if (nominationEndDate > values.votingStartDate) {
      ctx.addIssue({
        code: "custom",
        path: ["nominationEndDate"],
        message: "Nomination end date must not be after the voting start date.",
      });
    }
  });

export type CreateUpdateAwardsEventValues = z.infer<
  typeof createUpdateAwardsEventSchema
>;

export const DEFAULT_NOMINEE_COUNT = 6;

const EN_LOCALE = "en" as AwardsCategoryTranslationInputDto["locale"];
const PT_BR_LOCALE = "pt-BR" as AwardsCategoryTranslationInputDto["locale"];

const hasText = (value?: string) => (value?.trim().length ?? 0) > 0;

/**
 * Each locale is optional as a pair: either both of its fields are filled in,
 * or neither is. The base `name` and `description` stay required.
 */
export const createUpdateAwardsCategorySchema = z
  .object({
    name: z.string(),
    description: z.string(),
    order: z.number(),
    nomineeCount: z.number().int().min(1),
    nameEn: z.string().optional(),
    descriptionEn: z.string().optional(),
    namePtBR: z.string().optional(),
    descriptionPtBR: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const locales = [
      {
        name: values.nameEn,
        namePath: "nameEn",
        description: values.descriptionEn,
        descriptionPath: "descriptionEn",
      },
      {
        name: values.namePtBR,
        namePath: "namePtBR",
        description: values.descriptionPtBR,
        descriptionPath: "descriptionPtBR",
      },
    ];

    for (const locale of locales) {
      const hasName = hasText(locale.name);
      const hasDescription = hasText(locale.description);

      if (hasName === hasDescription) continue;

      ctx.addIssue({
        code: "custom",
        path: [hasName ? locale.descriptionPath : locale.namePath],
        message: "Name and description must be filled in together.",
      });
    }
  });

export type CreateUpdateAwardsCategoryValues = z.infer<
  typeof createUpdateAwardsCategorySchema
>;

export type AwardsCategoryTranslationValues = Pick<
  CreateUpdateAwardsCategoryValues,
  "nameEn" | "descriptionEn" | "namePtBR" | "descriptionPtBR"
>;

/**
 * Builds the complete translations set sent on save. The server replaces the
 * whole set, so a locale left empty is omitted and therefore removed.
 */
export const toTranslationsPayload = (
  values: AwardsCategoryTranslationValues,
): AwardsCategoryTranslationInputDto[] => {
  const translations: AwardsCategoryTranslationInputDto[] = [];

  const nameEn = values.nameEn?.trim();
  const descriptionEn = values.descriptionEn?.trim();

  if (nameEn && descriptionEn) {
    translations.push({
      locale: EN_LOCALE,
      name: nameEn,
      description: descriptionEn,
    });
  }

  const namePtBR = values.namePtBR?.trim();
  const descriptionPtBR = values.descriptionPtBR?.trim();

  if (namePtBR && descriptionPtBR) {
    translations.push({
      locale: PT_BR_LOCALE,
      name: namePtBR,
      description: descriptionPtBR,
    });
  }

  return translations;
};
