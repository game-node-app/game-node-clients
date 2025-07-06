import { Anchor, Box, Group, Text, UnstyledButton } from "@mantine/core";
import {
  IconHeartFilled,
  IconLogout,
  IconSettings,
  IconUserShield,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import classes from "./global-shell-navbar.module.css";
import GlobalShellNavbarCollections from "@/components/general/shell/GlobalShellNavbar/GlobalShellNavbarCollections";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { useMemo, useState } from "react";
import GlobalNavbarSearchBar from "@/components/general/shell/GlobalShellNavbar/search-bar/GlobalShellNavbarSearchBar";
import { EUserRoles, UserButton, useUserProfile, useUserRoles } from "@repo/ui";
import clsx from "clsx";

interface NavbarItem {
  label: string;
  href: string;
}

const links: NavbarItem[] = [
  { label: "Explore", href: "/explore" },
  { label: "Library", href: "/library" },
  { label: "Achievements", href: "/achievements" },
  { label: "Posts", href: "/posts" },
  { label: "Blog", href: "/blog" },
  { label: "Activity", href: "/activity" },
  { label: "Importer", href: "/importer" },
];

interface IGlobalShellNavbarProps extends BaseModalChildrenProps {
  onOpen: () => void;
}

export default function GlobalShellNavbar({
  onOpen,
  onClose,
}: IGlobalShellNavbarProps) {
  const [query, setQuery] = useState<string>("");
  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;
  const userProfileQuery = useUserProfile(
    session.loading ? undefined : session.userId,
  );

  const userRoles = useUserRoles();

  const hasAdminRouteAccess = useMemo(() => {
    return userRoles.some((role) => {
      return [EUserRoles.MOD.valueOf(), EUserRoles.ADMIN.valueOf()].includes(
        role,
      );
    });
  }, [userRoles]);

  const userProfile = userProfileQuery.data;

  const mainLinks = links.map((link) => (
    <UnstyledButton key={link.label} className={classes.mainLink}>
      <Link
        href={link.href}
        className={classes.mainLinkInner}
        onClick={onClose}
      >
        <span>{link.label}</span>
      </Link>
    </UnstyledButton>
  ));

  return (
    <div className={classes.navbar}>
      {isLoggedIn && userProfile && (
        <div className={classes.section}>
          <Link href={`/profile/${userProfile.userId}`} onClick={onClose}>
            <UserButton userId={userProfile.userId} />
          </Link>
        </div>
      )}

      <Box w={"100%"} className={!isLoggedIn ? "my-md" : "mb-md"}>
        <GlobalNavbarSearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onOptionSubmit={(value, options, combobox) => {
            /**
             * Navigation is already handled by <Link> in the options components!
             */
            setQuery("");
            combobox.closeDropdown();
            if (onClose) onClose();
          }}
          onClear={() => setQuery("")}
          onHotkeyPress={onOpen}
        />
      </Box>

      <div className={clsx(classes.section, "ps-6")}>
        <div className="">
          {mainLinks}
          {hasAdminRouteAccess && (
            <UnstyledButton className={classes.mainLink}>
              <Anchor
                href={"https://admin.gamenode.app"}
                target={"_blank"}
                className={classes.mainLinkInner}
                onClick={onClose}
              >
                <Group gap={0} wrap={"nowrap"} align={"center"}>
                  <IconUserShield
                    size={20}
                    className={classes.mainLinkIcon}
                    stroke={1.5}
                  />
                  <span>Admin</span>
                </Group>
              </Anchor>
            </UnstyledButton>
          )}
        </div>
      </div>
      <GlobalShellNavbarCollections onClose={onClose} />
      <div className={`${classes.section} mt-auto mb-0 flex flex-col `}>
        {isLoggedIn && (
          <Link href={"/preferences"} onClick={onClose}>
            <Group className={"gap-1 px-md py-sm"}>
              <IconSettings></IconSettings>
              <Text span>Settings</Text>
            </Group>
          </Link>
        )}
        <Link
          href={"https://patreon.com/GameNodeApp"}
          target={"_blank"}
          onClick={onClose}
        >
          <Group className={"gap-1 w-full px-md py-sm bg-[#f96854] text-white"}>
            <IconHeartFilled />
            <Text span>Support us</Text>
          </Group>
        </Link>
        {isLoggedIn && (
          <Link href={"/auth/logout"}>
            <Group
              className={"gap-1 w-full px-md py-sm bg-[#F49898] text-white"}
            >
              <IconLogout />
              <Text span>Logout</Text>
            </Group>
          </Link>
        )}
      </div>
    </div>
  );
}
