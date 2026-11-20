// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (language: "en" | "pt-BR") =>
  JSON.parse(
    readFileSync(
      new URL(
        `../../../../packages/locales/src/translations/json/${language}.json`,
        import.meta.url,
      ),
      "utf8",
    ),
  ) as Record<string, unknown>;

const flatten = (value: unknown, prefix = ""): string[] => {
  if (value == null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key),
  );
};

describe("console locale strings", () => {
  const en = read("en");
  const ptBr = read("pt-BR");

  it("keeps both languages with the same keys", () => {
    expect(flatten(ptBr).sort()).toEqual(flatten(en).sort());
  });

  it.each([
    "console.a11y.row",
    "console.explore.bestRated",
    "console.search.title",
  ])("has %s in both languages", (key) => {
    const get = (source: unknown) =>
      key
        .split(".")
        .reduce<unknown>(
          (current, part) =>
            current && typeof current === "object"
              ? (current as Record<string, unknown>)[part]
              : undefined,
          source,
        );

    expect(typeof get(en)).toBe("string");
    expect(typeof get(ptBr)).toBe("string");
    expect(get(en)).not.toBe(get(ptBr));
  });
});
