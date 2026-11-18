import { cn, Link, useRouter } from "#@/util";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface NavbarLink {
  label: string;
  href: string;
  /** Tag the link filters by; `undefined` for the home/archive entries. */
  tag?: string;
}

const BlogPostsNavHeader = () => {
  const { t } = useTranslation();
  const { pathname, query } = useRouter();
  const currentTag = query?.get("tag") ?? undefined;

  const LINKS: NavbarLink[] = [
    { label: t("blog.nav.home"), href: "/blog" },
    { label: t("blog.nav.archive"), href: "/blog/archive" },
    { label: t("blog.nav.news"), href: "/blog/archive?tag=news", tag: "news" },
    {
      label: t("blog.nav.reviews"),
      href: "/blog/archive?tag=review",
      tag: "review",
    },
    {
      label: t("blog.nav.articles"),
      href: "/blog/archive?tag=article",
      tag: "article",
    },
    {
      label: t("blog.nav.gameNode"),
      href: "/blog/archive?tag=gamenode",
      tag: "gamenode",
    },
  ];

  const isActive = (link: NavbarLink) => {
    if (link.tag) {
      return pathname.startsWith("/blog/archive") && currentTag === link.tag;
    }
    if (link.href === "/blog/archive") {
      return pathname.startsWith("/blog/archive") && !currentTag;
    }
    return pathname === "/blog";
  };

  return (
    <nav
      aria-label="Blog"
      className={
        "flex w-full gap-2 flex-nowrap overflow-x-auto whitespace-nowrap pb-1 justify-start lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {LINKS.map((config) => {
        const active = isActive(config);
        return (
          <Link
            key={config.href}
            href={config.href}
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
