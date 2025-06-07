import React from "react";
import { Center, Group, ScrollArea, Text } from "@mantine/core";
import { Link } from "#@/util";

interface NavbarLink {
  label: string;
  href: string;
}

const LINKS: NavbarLink[] = [
  {
    label: "Home",
    href: "/blog",
  },
  {
    label: "Archive",
    href: "/blog/archive",
  },
  {
    label: "News",
    href: "/blog/archive?tag=news",
  },

  {
    label: "Reviews",
    href: "/blog/archive?tag=review",
  },
  {
    label: "Articles",
    href: "/blog/archive?tag=article",
  },
  {
    label: "GameNode",
    href: "/blog/archive?tag=gamenode",
  },
];

const BlogPostsNavHeader = () => {
  return (
    <Group
      className={
        "gap-5 flex-nowrap w-full mb-3 lg:mb-0 overflow-auto whitespace-nowrap pb-2 justify-start lg:justify-center"
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
