import { GlobalShellNavbarCollectionsMenu } from "@/components/general/shell/navbar/GlobalShellNavbarCollectionsMenu";
import { GlobalShellNavbarUserMenu } from "@/components/general/shell/navbar/user-menu/GlobalShellNavbarUserMenu";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { Center, Divider, Flex, Indicator, Tooltip, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  cn,
  RecentlyPlayedGamesShare,
  ThemeSwitcherMenu,
  useUserId,
} from "@repo/ui";
import {
  IconBolt,
  IconRobot,
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
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ExoticComponent, PropsWithoutRef, useCallback } from "react";

export interface NavbarItem {
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  label: string;
  href: string;
  withDivider?: boolean;
  onClick?: LinkProps["onClick"];
  isNew?: boolean;
}

const NAVBAR_ITEM_CLASSNAME =
  "w-full hover:bg-paper-8 hover:opacity-90 data-[active=true]:bg-paper-8 h-8 rounded-md flex items-center justify-center gap-1";

interface IGlobalShellNavbarProps extends BaseModalChildrenProps {
  onOpen: () => void;
  isOpen: boolean;
  /** Console app themes render the navbar as a row inside the header. */
  horizontal?: boolean;
}

export default function GlobalShellNavbar({
  onClose,
  horizontal = false,
}: IGlobalShellNavbarProps) {
  const [wrappedOpened, wrappedOpenedUtils] = useDisclosure();
  useUserId();
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
    { icon: IconRobot, label: t("mcp.title"), href: "/mcp", isNew: true },
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
    [pathname]
  );

  const itemClassName = cn(NAVBAR_ITEM_CLASSNAME, horizontal && "w-9 shrink-0");

  return (
    <Flex
      direction={horizontal ? "row" : "column"}
      className={cn(
        "gap-4 items-center relative h-full",
        horizontal
          ? "min-w-0 overflow-x-auto px-2"
          : "pt-4 px-2 bg-paper-7",
      )}
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
      <GlobalShellNavbarCollectionsMenu asAside={horizontal} />
      {links.map((link) => (
        <>
          <Tooltip label={link.label}>
            <UnstyledButton
              className={itemClassName}
              onClick={onClose}
              data-active={isActive(link.href) ? "true" : "false"}
            >
              <Link
                href={link.href}
                onClick={link.onClick}
                aria-label={link.label}
              >
                <Indicator size={8} disabled={!link.isNew}>
                  <link.icon className={""}></link.icon>
                </Indicator>
              </Link>
            </UnstyledButton>
          </Tooltip>

          {link.withDivider && (
            <Divider
              orientation={horizontal ? "vertical" : "horizontal"}
              className={horizontal ? "h-6 self-center" : "w-full"}
            />
          )}
        </>
      ))}
      <ThemeSwitcherMenu
        className={itemClassName}
        position={horizontal ? "bottom" : "right-start"}
      />
      {/* the console header shows the user menu on its left instead */}
      {!horizontal && (
        <Center className={"w-full mt-auto mb-2"}>
          <GlobalShellNavbarUserMenu />
        </Center>
      )}
    </Flex>
  );
}
