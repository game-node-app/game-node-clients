/**
 * Review content is stored as editor HTML, so a review with only stars is
 * `null`, `""` or an empty markup such as `<p></p>`.
 */
export function hasReviewContent(content: string | null | undefined): boolean {
  if (!content) return false;
  // Embedded media still counts as content.
  if (/<(img|iframe|video)\b/i.test(content)) return true;

  const text = content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/[\s\u200B-\u200D\uFEFF]+/g, "");

  return text.length > 0;
}
