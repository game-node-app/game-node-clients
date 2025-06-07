import React from "react";
import { Center } from "@mantine/core";
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
];

const BlogPostsNavHeader = () => {
  return (
    <Center className={"w-full "}>
      {LINKS.map((config) => (
        <Link
          key={config.href}
          href={config.href}
          className={"text-white font-semibold"}
        >
          {config.label}
        </Link>
      ))}
    </Center>
  );
};

export { BlogPostsNavHeader };
