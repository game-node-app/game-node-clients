import { cn } from "#@/util";
import { Text } from "@mantine/core";
import { BlogTagDto } from "@repo/wrapper/server";

/**
 * Stock Mantine colors per well-known category (tag id). The brand palette is flat, so shaded
 * brand values would not differ; unknown tags fall back to gray.
 */
const CATEGORY_COLORS: Record<string, string> = {
  news: "blue.4",
  review: "grape.4",
  article: "teal.4",
  gamenode: "brand",
};

const getCategoryColor = (tagId: string | undefined) =>
  (tagId && CATEGORY_COLORS[tagId.toLowerCase()]) || "gray.4";

interface Props {
  tags: BlogTagDto[];
  className?: string;
}

/**
 * Category of a post: its first tag, as a small uppercase colored label with a dot
 * (reference: TradingView news source label, Reddit post flair). Renders nothing without tags.
 */
const BlogPostCategoryLabel = ({ tags, className }: Props) => {
  const category = tags[0];
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
        className={"inline-block size-1.5 rounded-full bg-current"}
      />
      {category.name}
    </Text>
  );
};

export { BlogPostCategoryLabel, getCategoryColor };
