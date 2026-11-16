import { AwardsCategoryTranslationDto } from "@repo/wrapper/server";
import { describe, expect, it } from "vitest";
import {
  resolveAwardsCategoryText,
  type AwardsCategoryTextSource,
} from "../../../../../packages/ui/src/components/awards/shared/awardsCategoryText";

const EN = AwardsCategoryTranslationDto.locale.EN;
const PT_BR = AwardsCategoryTranslationDto.locale.PT_BR;

const base: AwardsCategoryTextSource = {
  name: "Base game of the year",
  description: "Base description.",
};

function translation(
  locale: AwardsCategoryTranslationDto.locale,
  name: string,
  description: string,
): AwardsCategoryTranslationDto {
  return { locale, name, description };
}

const enTranslation = translation(EN, "Game of the Year", "The main award.");
const ptBRTranslation = translation(
  PT_BR,
  "Jogo do Ano",
  "O prêmio principal.",
);

describe("resolveAwardsCategoryText", () => {
  it("uses the en entry for an en interface", () => {
    expect(
      resolveAwardsCategoryText(
        { ...base, translations: [ptBRTranslation, enTranslation] },
        "en",
      ),
    ).toEqual({ name: "Game of the Year", description: "The main award." });
  });

  it("uses the pt-BR entry for a pt-BR interface", () => {
    expect(
      resolveAwardsCategoryText(
        { ...base, translations: [enTranslation, ptBRTranslation] },
        "pt-BR",
      ),
    ).toEqual({ name: "Jogo do Ano", description: "O prêmio principal." });
  });

  it("normalizes a bare pt language to pt-BR", () => {
    expect(
      resolveAwardsCategoryText(
        { ...base, translations: [enTranslation, ptBRTranslation] },
        "pt",
      ),
    ).toEqual({ name: "Jogo do Ano", description: "O prêmio principal." });

    expect(
      resolveAwardsCategoryText(
        { ...base, translations: [ptBRTranslation] },
        "pt-PT",
      ),
    ).toEqual({ name: "Jogo do Ano", description: "O prêmio principal." });
  });

  it("falls back to the base text when the language has no entry", () => {
    expect(
      resolveAwardsCategoryText(
        { ...base, translations: [ptBRTranslation] },
        "en",
      ),
    ).toEqual(base);
  });

  it("falls back to the base text when translations are empty or missing", () => {
    expect(
      resolveAwardsCategoryText({ ...base, translations: [] }, "en"),
    ).toEqual(base);
    expect(resolveAwardsCategoryText(base, "en")).toEqual(base);
    expect(
      resolveAwardsCategoryText({ ...base, translations: undefined }, "en"),
    ).toEqual(base);
    expect(
      resolveAwardsCategoryText({ ...base, translations: null }, "en"),
    ).toEqual(base);
  });

  it("falls back to the base pair when the locale entry has an empty field", () => {
    expect(
      resolveAwardsCategoryText(
        {
          ...base,
          translations: [translation(EN, "Game of the Year", "")],
        },
        "en",
      ),
    ).toEqual(base);

    expect(
      resolveAwardsCategoryText(
        {
          ...base,
          translations: [translation(EN, "", "The main award.")],
        },
        "en",
      ),
    ).toEqual(base);
  });
});
