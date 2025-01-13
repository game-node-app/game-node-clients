import { type TablerIcon } from "@tabler/icons-react";
import { ComponentPropsWithoutRef, ReactNode } from "react";

export interface NavItem {
    label: string;
    icon: (props: ComponentPropsWithoutRef<TablerIcon>) => ReactNode;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string }[];
}
