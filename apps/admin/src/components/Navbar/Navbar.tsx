"use client";

import { Box, ScrollArea } from "@mantine/core";

import type { NavItem } from "@/types/nav-item";
import { NavLinksGroup } from "./NavLinksGroup";
import classes from "./Navbar.module.css";
import useUserId from "@/components/auth/hooks/useUserId";
import { EUserRoles, UserAvatarGroup, useUserRoles } from "@repo/ui";
import { getRolesForRoute } from "@/components/auth/roles.ts";
import { useMemo } from "react";

interface Props {
  data: NavItem[];
  hidden?: boolean;
}

const checkHasPermission = (
  userRoles: EUserRoles[],
  targetRoles: EUserRoles[],
) => {
  return userRoles.some((role) => targetRoles.includes(role));
};

export function Navbar({ data }: Props) {
  const userId = useUserId();
  const userRoles = useUserRoles();

  const links = useMemo(() => {
    if (userRoles == undefined || userRoles.length === 0) {
      return [];
    }

    return data.map((item) => {
      const rolesForRoute = getRolesForRoute(item.link);

      console.log(`Roles for ${item.link}:`, rolesForRoute);

      const hasPermission = checkHasPermission(userRoles, rolesForRoute);

      console.log(`Has permission: ${hasPermission}`);
      if (!hasPermission) return null;

      return <NavLinksGroup key={item.label} {...item} />;
    });
  }, [data, userRoles]);

  return (
    <>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <Box className={"w-full p-4"}>
          {userId && <UserAvatarGroup userId={userId} />}
        </Box>
      </div>
    </>
  );
}
