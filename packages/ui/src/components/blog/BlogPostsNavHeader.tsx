import { cn, Link, useRouter } from "#@/util";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useBlogCategories } from "./hooks/useBlogCategories";

interface NavbarLink {
  label: string;
  href: string;
  /** Tag the link filters by; `undefined` for the home/archive entries. */
  tag?: string;
}

const BlogPostsNavHeader = () => {
  const { t } = useTranslation();
  const { pathname, query } = useRouter();
  const categories = useBlogCategories();
  const currentTag = query?.get("tag") ?? undefined;
  const isArchive =
    pathname === "/blog/archive" || pathname === "/blog/archive/";

  const links: NavbarLink[] = [
    { label: t("blog.nav.home"), href: "/blog" },
    { label: t("blog.nav.archive"), href: "/blog/archive" },
    ...categories.map(({ id, title }) => ({
      label: title,
      href: `/blog/archive?tag=${encodeURIComponent(id)}`,
      tag: id,
    })),
  ];

  const isActive = (link: NavbarLink) => {
    if (link.tag) {
      return isArchive && currentTag === link.tag;
    }
    if (link.href === "/blog/archive") {
      return isArchive && !currentTag;
    }
    return pathname === "/blog";
  };

  return (
    <nav
      aria-label={t("navigation.blog")}
      className={
        "flex w-full gap-2 flex-nowrap overflow-x-auto whitespace-nowrap pb-1 justify-start lg:[justify-content:safe_center] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {links.map((config) => {
        const active = isActive(config);
        return (
          <Link
            key={config.href}
            href={config.href}
            replace={isArchive && config.href.startsWith("/blog/archive")}
            className={"min-h-min shrink-0"}
            aria-current={active ? "page" : undefined}
          >
            <Text
              size="sm"
              className={cn(
                "rounded-full border px-4 py-1.5 font-semibold transition-colors",
                active
                  ? "border-brand-5 bg-brand-5 text-white"
                  : "border-white/15 text-gray-300 hover:bg-white/5",
              )}
            >
              {config.label}
            </Text>
          </Link>
        );
      })}
    </nav>
  );
};

export { BlogPostsNavHeader };
