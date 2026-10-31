import { Anchor, Button, Container, Group, Menu } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "@repo/locales";

const LandingHeader = () => {
  const { t } = useTranslation();
  const links = [
    { href: "/about", label: t("landing.presentation.about") },
    { href: "/#premium", label: t("landing.presentation.premium") },
    { href: "/mcp", label: t("mcp.title") },
    {
      href: "https://play.google.com/store/apps/details?id=app.gamenode",
      label: t("landing.presentation.downloads"),
    },
    { href: "/blog", label: t("landing.presentation.blog") },
  ];
  return (
    <Container component="header" size={1302} py={32}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap={48} wrap="nowrap">
          <Link href="/" aria-label="GameNode">
            <img
              src="/img/landing/41a07.svg"
              width={85}
              height={36}
              alt="GameNode"
            />
          </Link>
          <Group
            component="nav"
            visibleFrom="md"
            gap={40}
            aria-label={t("landing.presentation.menu")}
          >
            {links.map(({ href, label }) => (
              <Anchor
                component={Link}
                c="white"
                size="sm"
                href={href}
                key={href}
              >
                {label}
              </Anchor>
            ))}
          </Group>
        </Group>
        <Group gap="sm" wrap="nowrap">
          <Button
            component={Link}
            href="/home"
            variant="outline"
            color="gray"
            size="xs"
            visibleFrom="sm"
          >
            {t("landing.presentation.signup")}
          </Button>
          <Button
            component={Link}
            href="/home"
            variant="outline"
            color="gray"
            size="xs"
          >
            {t("landing.presentation.login")}
          </Button>
          <Menu>
            <Menu.Target>
              <Button hiddenFrom="md" variant="subtle" color="gray" size="xs">
                {t("landing.presentation.menu")}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {links.map(({ href, label }) => (
                <Menu.Item component={Link} href={href} key={href}>
                  {label}
                </Menu.Item>
              ))}
              <Menu.Item component={Link} href="/home">
                {t("landing.presentation.signup")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Container>
  );
};
export { LandingHeader };
