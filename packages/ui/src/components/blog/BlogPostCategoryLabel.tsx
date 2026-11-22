import { cn } from "#@/util";
import { Text } from "@mantine/core";
import { BlogTagDto } from "@repo/wrapper/server";

/**
 * Theme category tokens per well-known category (tag id): the stock Mantine 4 shades on dark
 * themes, darker tones on light ones. The brand palette is flat, so shaded brand values would not
 * differ; unknown tags fall back to a grey token.
 */
const CATEGORY_COLORS = new Map([
  ["news", "var(--gn-category-news)"],
  ["review", "var(--gn-category-review)"],
  ["article", "var(--gn-category-article)"],
  ["gamenode", "brand"],
]);

const getCategoryColor = (tagId: string | undefined) =>
  CATEGORY_COLORS.get(tagId?.toLowerCase() ?? "") ?? "var(--gn-text-gray-4)";

interface Props {
  tags: BlogTagDto[];
  categoryId?: string;
  className?: string;
}

/**
 * Use the current category on filtered lists and the CMS tag order elsewhere.
 */
const BlogPostCategoryLabel = ({ tags, categoryId, className }: Props) => {
  const category = tags.find((tag) => tag.id === categoryId) ?? tags[0];
  if (!category) return null;

  return (
    <Text
      component="span"
      c={getCategoryColor(category.id)}
      className={cn(
        "flex items-center gap-1.5 text-[11px] leading-none font-bold uppercase tracking-wider",
        className,
      )}
    >
      <span
        aria-hidden
        className={"inline-block size-1.5 shrink-0 rounded-full bg-current"}
      />
      <span className="min-w-0 [overflow-wrap:anywhere]">{category.name}</span>
    </Text>
  );
};

export { BlogPostCategoryLabel, getCategoryColor };
