import {
  createUpdateAwardsCategorySchema,
  CreateUpdateAwardsCategoryValues,
  createUpdateAwardsEventSchema,
  toTranslationsPayload,
} from "./schemas";

const votingStartDate = new Date("2026-12-01T00:00:00.000Z");
const votingEndDate = new Date("2026-12-20T23:59:59.000Z");
const resultsDate = new Date("2026-12-27T00:00:00.000Z");
const nominationStartDate = new Date("2026-11-20T00:00:00.000Z");
const nominationEndDate = new Date("2026-11-28T23:59:59.000Z");
const eligibilityCutoffDate = new Date("2026-11-30T00:00:00.000Z");

const event = (overrides: Record<string, unknown> = {}) => ({
  year: 2026,
  votingStartDate,
  votingEndDate,
  resultsDate,
  nominationStartDate: null,
  nominationEndDate: null,
  eligibilityCutoffDate: null,
  ...overrides,
});

const issuesOf = (value: unknown) => {
  const result = createUpdateAwardsEventSchema.safeParse(value);
  return result.success ? [] : result.error.issues;
};

describe("createUpdateAwardsEventSchema", () => {
  it("accepts the full 2026 calendar", () => {
    expect(
      createUpdateAwardsEventSchema.safeParse(
        event({
          nominationStartDate,
          nominationEndDate,
          eligibilityCutoffDate,
        }),
      ).success,
    ).toBe(true);
  });

  it("accepts an event without nomination dates", () => {
    expect(createUpdateAwardsEventSchema.safeParse(event()).success).toBe(true);
  });

  it("accepts an eligibility cutoff without nomination dates", () => {
    expect(
      createUpdateAwardsEventSchema.safeParse(event({ eligibilityCutoffDate }))
        .success,
    ).toBe(true);
  });

  it.each([
    ["only the nomination start", { nominationStartDate }],
    ["only the nomination end", { nominationEndDate }],
  ])("rejects %s", (_, dates) => {
    const issues = issuesOf(event(dates));

    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe(
      "Nomination start and end dates must be informed together.",
    );
  });

  it("rejects equal nomination start and end", () => {
    expect(
      createUpdateAwardsEventSchema.safeParse(
        event({
          nominationStartDate,
          nominationEndDate: nominationStartDate,
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects nomination end before the nomination start", () => {
    expect(
      createUpdateAwardsEventSchema.safeParse(
        event({
          nominationStartDate: nominationEndDate,
          nominationEndDate: nominationStartDate,
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects nomination end after the voting start", () => {
    expect(
      createUpdateAwardsEventSchema.safeParse(
        event({
          nominationStartDate,
          nominationEndDate: new Date("2026-12-02T00:00:00.000Z"),
        }),
      ).success,
    ).toBe(false);
  });

  it("accepts nomination end equal to the voting start", () => {
    expect(
      createUpdateAwardsEventSchema.safeParse(
        event({
          nominationStartDate,
          nominationEndDate: votingStartDate,
        }),
      ).success,
    ).toBe(true);
  });
});

describe("createUpdateAwardsCategorySchema", () => {
  const category = (overrides: Record<string, unknown> = {}) => ({
    name: "Best Narrative",
    description: "Storytelling at its best.",
    order: 2,
    nomineeCount: 6,
    ...overrides,
  });

  it("accepts five nominees", () => {
    expect(
      createUpdateAwardsCategorySchema.safeParse(category({ nomineeCount: 5 }))
        .success,
    ).toBe(true);
  });

  it.each([0, -1, 2.5])("rejects nomineeCount %s", (nomineeCount) => {
    expect(
      createUpdateAwardsCategorySchema.safeParse(category({ nomineeCount }))
        .success,
    ).toBe(false);
  });
});

describe("createUpdateAwardsCategorySchema translations", () => {
  const category = (
    overrides: Partial<CreateUpdateAwardsCategoryValues> = {},
  ): CreateUpdateAwardsCategoryValues => ({
    name: "Best Narrative",
    description: "Storytelling at its best.",
    order: 2,
    nomineeCount: 6,
    ...overrides,
  });

  const translationIssuesOf = (value: CreateUpdateAwardsCategoryValues) => {
    const result = createUpdateAwardsCategorySchema.safeParse(value);
    return result.success ? [] : result.error.issues;
  };

  it("accepts and sends both locales, trimmed", () => {
    const values = category({
      nameEn: "  Best Narrative  ",
      descriptionEn: " Storytelling at its best. ",
      namePtBR: " Melhor Narrativa ",
      descriptionPtBR: " Narrativa no seu melhor. ",
    });

    expect(createUpdateAwardsCategorySchema.safeParse(values).success).toBe(
      true,
    );
    expect(toTranslationsPayload(values)).toEqual([
      {
        locale: "en",
        name: "Best Narrative",
        description: "Storytelling at its best.",
      },
      {
        locale: "pt-BR",
        name: "Melhor Narrativa",
        description: "Narrativa no seu melhor.",
      },
    ]);
  });

  it("accepts and sends only the locale that was filled", () => {
    const values = category({
      namePtBR: "Melhor Narrativa",
      descriptionPtBR: "Narrativa no seu melhor.",
    });

    expect(createUpdateAwardsCategorySchema.safeParse(values).success).toBe(
      true,
    );
    expect(toTranslationsPayload(values)).toEqual([
      {
        locale: "pt-BR",
        name: "Melhor Narrativa",
        description: "Narrativa no seu melhor.",
      },
    ]);
  });

  it.each<[string, Partial<CreateUpdateAwardsCategoryValues>, string]>([
    [
      "an English name without its description",
      { nameEn: "Best Narrative" },
      "descriptionEn",
    ],
    [
      "an English description without its name",
      { descriptionEn: "Storytelling at its best." },
      "nameEn",
    ],
    [
      "a Portuguese name without its description",
      { namePtBR: "Melhor Narrativa" },
      "descriptionPtBR",
    ],
    [
      "a Portuguese description without its name",
      { descriptionPtBR: "Narrativa no seu melhor." },
      "namePtBR",
    ],
  ])("rejects %s, with the error on the empty field", (_, overrides, path) => {
    const issues = translationIssuesOf(category(overrides));

    expect(issues).toHaveLength(1);
    expect(issues[0].path).toEqual([path]);
  });

  it("treats whitespace-only fields as empty", () => {
    const issues = translationIssuesOf(
      category({
        nameEn: "   ",
        descriptionEn: "Storytelling at its best.",
      }),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].path).toEqual(["nameEn"]);
  });

  it("accepts and sends [] when every locale is empty", () => {
    const values = category({
      nameEn: "",
      descriptionEn: "  ",
      namePtBR: "",
      descriptionPtBR: "",
    });

    expect(createUpdateAwardsCategorySchema.safeParse(values).success).toBe(
      true,
    );
    expect(toTranslationsPayload(values)).toEqual([]);
  });
});
