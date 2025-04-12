import {
  IconBrandBlogger,
  IconCheckbox,
  IconDashboard,
  IconReport,
  IconUsers,
} from "@tabler/icons-react";
import type { NavItem } from "@/types/nav-item";
import { EUserRoles } from "@repo/ui";

export const navLinks: NavItem[] = [
  {
    label: "Dashboard",
    icon: IconDashboard,
    link: "/dashboard/home",
    roles: [EUserRoles.ADMIN, EUserRoles.MOD, EUserRoles.EDITOR],
  },
  {
    label: "Users",
    icon: IconUsers,
    link: "/dashboard/user",
    roles: [EUserRoles.ADMIN, EUserRoles.MOD],
  },
  {
    label: "Reports",
    icon: IconReport,
    link: "/dashboard/report",
    roles: [EUserRoles.ADMIN, EUserRoles.MOD],
  },
  {
    label: "Achievements",
    icon: IconCheckbox,
    initiallyOpened: false,
    roles: [EUserRoles.ADMIN, EUserRoles.MOD],
    link: "/dashboard/achievement",
    links: [
      {
        label: "Generate code",
        link: "/dashboard/achievement/generate",
      },
      {
        label: "Grant",
        link: "/dashboard/achievement/grant",
      },
    ],
  },
  {
    label: "Blog",
    icon: IconBrandBlogger,
    initiallyOpened: false,
    roles: [EUserRoles.ADMIN, EUserRoles.MOD, EUserRoles.EDITOR],
    link: "/dashboard/blog",
    links: [
      {
        label: "Create post",
        link: "/dashboard/blog/create",
      },
      {
        label: "Posts",
        link: "/dashboard/blog",
      },
    ],
  },
];
