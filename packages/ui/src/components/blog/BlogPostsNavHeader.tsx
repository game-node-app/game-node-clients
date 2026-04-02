import React from "react";
import { Center, Group, ScrollArea, Text } from "@mantine/core";
import { Link } from "#@/util";
import { useTranslation } from "@repo/locales";

interface NavbarLink {
  label: string;
  href: string;
}

const BlogPostsNavHeader = () => {
  const { t } = useTranslation();

  const LINKS: NavbarLink[] = [
    {
      label: t("blog.nav.home"),
      href: "/blog",
    },
    {
      label: t("blog.nav.archive"),
      href: "/blog/archive",
    },
    {
      label: t("blog.nav.news"),
      href: "/blog/archive?tag=news",
    },
    {
      label: t("blog.nav.reviews"),
      href: "/blog/archive?tag=review",
    },
    {
      label: t("blog.nav.articles"),
      href: "/blog/archive?tag=article",
    },
    {
      label: t("blog.nav.gameNode"),
      href: "/blog/archive?tag=gamenode",
    },
  ];

  return (
    <Group
      className={
        "gap-5 flex-nowrap w-full lg:mb-0 overflow-auto whitespace-nowrap pb-2 justify-start lg:justify-center"
      }
    >
      {LINKS.map((config) => (
        <Link key={config.href} href={config.href}>
          <Text className={"text-white font-semibold"}>{config.label}</Text>
        </Link>
      ))}
    </Group>
  );
};

export { BlogPostsNavHeader };
