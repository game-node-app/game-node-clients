import {
  Center,
  Divider,
  HoverCard,
  Popover,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBolt,
  IconChevronsRight,
  IconHome,
  IconLibrary,
  IconMilitaryAward,
  IconNews,
  IconNotebook,
  IconProps,
  IconStars,
  IconTrendingUp,
  IconTrophy,
} from "@tabler/icons-react";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { ExoticComponent, PropsWithoutRef, useCallback } from "react";
import { cn } from "@repo/ui";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { GlobalShellNavbarCollectionsSection } from "@/components/general/shell/GlobalShellNavbar/GlobalShellNavbarCollectionsSection";
import { GlobalShellNavbarCollectionsMenu } from "@/components/general/shell/GlobalShellNavbar/GlobalShellNavbarCollectionsMenu";
import { useRouter } from "next/router";

export interface NavbarItem {
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  label: string;
  href: string;
  withDivider?: boolean;
}

const links: NavbarItem[] = [
  { icon: IconLibrary, label: "Library", href: "/library", withDivider: true },
  { icon: IconHome, label: "Home", href: "/home" },
  { icon: IconTrendingUp, label: "Explore", href: "/explore" },
  { icon: IconBolt, label: "Activity", href: "/activity" },
  { icon: IconNews, label: "Blog", href: "/blog", withDivider: true },
  {
    icon: IconNotebook,
    label: "Journal",
    href: "/profile?tab=journal",
  },
  {
    icon: IconTrophy,
    label: "Achievements",
    href: "/achievements",
  },
  {
    icon: IconMilitaryAward,
    label: "Feats",
    href: "/feats",
  },
];

interface IGlobalShellNavbarProps extends BaseModalChildrenProps {
  onOpen: () => void;
  isOpen: boolean;
}

export default function GlobalShellNavbar({
  onClose,
}: IGlobalShellNavbarProps) {
  const router = useRouter();
  const pathname = router.pathname;

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
