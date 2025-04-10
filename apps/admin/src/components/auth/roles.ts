import { navLinks } from "@/components/Navbar/Navbar.config.ts";

export enum EUserRoles {
  ADMIN = "admin",
  USER = "user",
  MOD = "mod",
  EDITOR = "editor",
}

export const getRolesForRoute = (pathname: string) => {
  const matchingRoute = navLinks.find((item) => item.link.startsWith(pathname));

  if (matchingRoute) {
    return matchingRoute.roles;
  }

  return [EUserRoles.ADMIN];
};
