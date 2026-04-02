import React from "react";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Container,
  Group,
  Text,
} from "@mantine/core";
import Link from "next/link";
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandTwitter,
} from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

type IFooterLink = { href: string; label: string; external?: boolean };

const GlobalShellFooter = () => {
  const { t } = useTranslation();
  const links: IFooterLink[] = [
    { label: t("navigation.about"), href: "/about" },
    { label: t("navigation.privacy"), href: "/privacy" },
    { label: t("navigation.terms"), href: "/tos" },
  ];
  const items = links.map((link) => {
    return (
      <Link
        key={link.label}
        href={link.href}
        target={link.external ? "_blank" : undefined}
      >
        <Text c="dimmed">{link.label}</Text>
      </Link>
    );
  });
  return (
    <footer className={"w-full p-2 px-4 h-full "}>
      <Container
        fluid
        p={0}
        className="flex justify-between gap-8 w-full h-full items-center"
      >
        <Group className="" wrap={"nowrap"}>
          {items}
        </Group>
        <Group gap="xs" justify="right" wrap={"nowrap"}>
          <Link target={"_blank"} href={"https://github.com/game-node-app"}>
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandGithub size="1.05rem" stroke={1.5} />
            </ActionIcon>
          </Link>
          <Link target={"_blank"} href={"https://discord.gg/8cPtfHtk"}>
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandDiscord size="1.05rem" stroke={1.5} />
            </ActionIcon>
          </Link>
          <Link target={"_blank"} href={"https://twitter.com/gamenodeapp"}>
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandTwitter size="1.05rem" stroke={1.5} />
            </ActionIcon>
          </Link>
        </Group>
      </Container>
    </footer>
  );
};

export default GlobalShellFooter;
