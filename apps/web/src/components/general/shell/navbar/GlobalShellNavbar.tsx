import {
  Box,
  Center,
  Divider,
  Stack,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBolt,
  IconHome,
  IconLayout2Filled,
  IconLibrary,
  IconMilitaryAward,
  IconNews,
  IconNotebook,
  IconProps,
  IconTrendingUp,
  IconTrophy,
} from "@tabler/icons-react";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import React, {
  ExoticComponent,
  MouseEventHandler,
  PropsWithoutRef,
  useCallback,
} from "react";
import { cn, RecentlyPlayedGamesShare, UserButton, useUserId } from "@repo/ui";
import Link, { LinkProps } from "next/link";
import { GlobalShellNavbarCollectionsMenu } from "@/components/general/shell/navbar/GlobalShellNavbarCollectionsMenu";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { GlobalShellNavbarUserMenu } from "@/components/general/shell/navbar/user-menu/GlobalShellNavbarUserMenu";
import { useDisclosure } from "@mantine/hooks";

export interface NavbarItem {
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  label: string;
  href: string;
  withDivider?: boolean;
  onClick?: LinkProps["onClick"];
}

interface IGlobalShellNavbarProps extends BaseModalChildrenProps {
  onOpen: () => void;
  isOpen: boolean;
}

export default function GlobalShellNavbar({
  onClose,
}: IGlobalShellNavbarProps) {
  const [wrappedOpened, wrappedOpenedUtils] = useDisclosure();
  const userId = useUserId();
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
    {
      icon: IconLayout2Filled,
      label: t("mobile.wrapped.title"),
      href: "#",
      onClick: (evt) => {
        evt.preventDefault();
        wrappedOpenedUtils.open();
      },
    },
  ];

  const isActive = useCallback(
    (href: string) => pathname.startsWith(href),
    [pathname],
  );

  return (
    <Stack
      className={cn("pt-4 px-2 gap-4 bg-paper-7 items-center relative h-full")}
    >
      <RecentlyPlayedGamesShare
        opened={wrappedOpened}
        onClose={wrappedOpenedUtils.close}
        onShare={async (file) => {
          const toShare: ShareData = {
            title: t("game.share.title"),
            text: t("game.share.recentlyPlayed"),
            files: [file],
            url: `https://gamenode.app`,
          };

          await navigator.share(toShare);
        }}
      />
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
              <Link href={link.href} onClick={link.onClick}>
                <link.icon className={""}></link.icon>
              </Link>
            </UnstyledButton>
          </Tooltip>

          {link.withDivider && <Divider className={"w-full"} />}
        </>
      ))}
      <Center className={"w-full mt-auto mb-2"}>
        <GlobalShellNavbarUserMenu />
      </Center>
    </Stack>
  );
}
