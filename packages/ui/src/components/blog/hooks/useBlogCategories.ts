import { useTranslation } from "@repo/locales";
import { useBlogPostTags } from "./useBlogPostTags";

const editorialCategories = [
  { id: "news", label: "blog.nav.news" },
  { id: "review", label: "blog.nav.reviews" },
  { id: "article", label: "blog.nav.articles" },
  { id: "gamenode", label: "blog.nav.gameNode" },
] as const;

export function useBlogCategories() {
  const { t } = useTranslation();
  const { data = [] } = useBlogPostTags();
  const remaining = new Map(data.map((tag) => [tag.id, tag]));
  const categories = editorialCategories.flatMap(({ id, label }) =>
    remaining.delete(id) ? [{ id, title: t(label) }] : [],
  );
  return [
    ...categories,
    ...Array.from(remaining.values(), ({ id, name }) => ({ id, title: name })),
  ];
}
