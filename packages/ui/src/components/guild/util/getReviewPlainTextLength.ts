const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: "\u00a0",
  quot: '"',
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, entity) => {
    if (entity.startsWith("#")) {
      const isHex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(
        isHex ? entity.slice(2) : entity.slice(1),
        isHex ? 16 : 10,
      );

      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) {
        return match;
      }

      return String.fromCodePoint(code);
    }

    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/**
 * Trimmed plain-text length of review editor HTML, matching what the server
 * counts toward a Guild `write_review` contract (design D10: strip tags and
 * decode entities, then trim). Works without a DOM for SSR.
 */
export function getReviewPlainTextLength(
  html: string | null | undefined,
): number {
  if (!html) return 0;

  const text = (() => {
    if (typeof DOMParser !== "undefined") {
      try {
        const parsed = new DOMParser().parseFromString(html, "text/html");

        if (parsed.body) {
          return parsed.body.textContent ?? "";
        }
      } catch {
        // Fall through to the regex path when the runtime rejects the markup.
      }
    }

    return decodeEntities(html.replace(/<[^>]*>/g, ""));
  })();

  return text.trim().length;
}
