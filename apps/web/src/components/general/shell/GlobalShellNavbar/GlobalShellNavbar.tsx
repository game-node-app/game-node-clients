import { Box, Stack, UnstyledButton } from "@mantine/core";
import {
  IconBolt,
  IconChevronRight,
  IconChevronsRight,
  IconHome,
  IconLibrary,
  IconNews,
  IconProps,
  IconTrendingUp,
} from "@tabler/icons-react";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { ExoticComponent, PropsWithoutRef } from "react";
import { cn } from "@repo/ui";
import Link from "next/link";

export interface NavbarItem {
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  label: string;
  href: string;
  withDivider?: boolean;
}

const links: NavbarItem[] = [
  { icon: IconLibrary, label: "Library", href: "/library" },
  { icon: IconHome, label: "Home", href: "/home" },
  { icon: IconTrendingUp, label: "Explore", href: "/explore" },
  { icon: IconBolt, label: "Activity", href: "/activity" },
  { icon: IconNews, label: "Blog", href: "/blog", withDivider: true },
];

interface IGlobalShellNavbarProps extends BaseModalChildrenProps {
  onOpen: () => void;
  isOpen: boolean;
}

export default function GlobalShellNavbar({
  isOpen,
  onOpen,
  onClose,
}: IGlobalShellNavbarProps) {
  return (
    <Stack
      pos={"static"}
      className={cn("pt-4 px-2 gap-4 bg-paper-7 items-center", {
        "w-16": isOpen,
        "": !isOpen,
      })}
    >
      <UnstyledButton>
        <IconChevronsRight></IconChevronsRight>
      </UnstyledButton>
      {links.map((link) => (
        <UnstyledButton className={""}>
          <Link href={link.href}>
            <link.icon className={""}></link.icon>
          </Link>
        </UnstyledButton>
      ))}
    </Stack>
  );
}
