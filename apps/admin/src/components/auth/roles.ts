import { navLinks } from "@/components/Navbar/Navbar.config.ts";

export enum EUserRoles {
  ADMIN = "admin",
  USER = "user",
  MOD = "mod",
  EDITOR = "editor",
}

export const getRolesForRoute = (pathname: string) => {
  if (pathname.startsWith("/dashboard/blog/preview/"))
    return [EUserRoles.ADMIN, EUserRoles.MOD, EUserRoles.EDITOR];
  // Excludes path parameter
  const parsedPathname = pathname.split("/[")[0];
  const matchingRoute = navLinks.find((item) =>
    item.link.startsWith(parsedPathname),
  );

  if (matchingRoute) {
    return matchingRoute.roles;
  }

  return [EUserRoles.ADMIN];
};
