import { Divider, Stack, Tooltip, UnstyledButton } from "@mantine/core";
import {
  IconBolt,
  IconHome,
  IconLibrary,
  IconMilitaryAward,
  IconNews,
  IconNotebook,
  IconProps,
  IconTrendingUp,
  IconTrophy,
} from "@tabler/icons-react";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { ExoticComponent, PropsWithoutRef, useCallback } from "react";
import { cn } from "@repo/ui";
import Link from "next/link";
import { GlobalShellNavbarCollectionsMenu } from "@/components/general/shell/GlobalShellNavbar/GlobalShellNavbarCollectionsMenu";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";

export interface NavbarItem {
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  label: string;
  href: string;
  withDivider?: boolean;
}

interface IGlobalShellNavbarProps extends BaseModalChildrenProps {
  onOpen: () => void;
  isOpen: boolean;
}

export default function GlobalShellNavbar({
  onClose,
}: IGlobalShellNavbarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = router.pathname;

  const links: NavbarItem[] = [
    {
      icon: IconLibrary,
      label: t("navigation.library"),
      href: "/library",
      withDivider: true,
    },
    { icon: IconHome, label: t("navigation.home"), href: "/home" },
    { icon: IconTrendingUp, label: t("navigation.explore"), href: "/explore" },
    { icon: IconBolt, label: t("navigation.activity"), href: "/activity" },
    {
      icon: IconNews,
      label: t("navigation.blog"),
      href: "/blog",
      withDivider: true,
    },
    {
      icon: IconNotebook,
      label: t("navigation.journal"),
      href: "/profile?tab=journal",
    },
    {
      icon: IconTrophy,
      label: t("navigation.achievements"),
      href: "/achievements",
    },
    {
      icon: IconMilitaryAward,
      label: t("navigation.feats"),
      href: "/feats",
    },
  ];

  const isActive = useCallback(
    (href: string) => pathname.startsWith(href),
    [pathname],
  );

  return (
    <Stack className={cn("pt-4 px-2 gap-4 bg-paper-7 items-center relative")}>
      <GlobalShellNavbarCollectionsMenu />
      {links.map((link) => (
        <>
          <Tooltip label={link.label}>
            <UnstyledButton
              className={
                "w-full hover:bg-paper-8 hover:opacity-90 data-[active=true]:bg-paper-8 h-8 rounded-md flex items-center justify-center gap-1"
              }
              onClick={onClose}
              data-active={isActive(link.href) ? "true" : "false"}
            >
              <Link href={link.href}>
                <link.icon className={""}></link.icon>
              </Link>
            </UnstyledButton>
          </Tooltip>

          {link.withDivider && <Divider className={"w-full"} />}
        </>
      ))}
    </Stack>
  );
}
