import { type TablerIcon } from "@tabler/icons-react";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { EUserRoles } from "@repo/ui";

export interface NavItem {
  label: string;
  icon: (props: ComponentPropsWithoutRef<TablerIcon>) => ReactNode;
  link: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  roles: EUserRoles[];
}
