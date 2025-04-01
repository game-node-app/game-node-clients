import {
  Anchor,
  Box,
  Group,
  Switch,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBulb,
  IconCheckbox,
  IconHeartFilled,
  IconLogout,
  IconMessage2,
  IconProps,
  IconRefresh,
  IconRouteAltLeft,
  IconSettings,
  IconUser,
  IconUserShield,
} from "@tabler/icons-react";
import { UserButton } from "@/components/general/input/UserButton/UserButton";
import Link from "next/link";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import classes from "./global-shell-navbar.module.css";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import GlobalShellNavbarCollections from "@/components/general/shell/GlobalShellNavbar/GlobalShellNavbarCollections";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { ExoticComponent, PropsWithoutRef, useMemo, useState } from "react";
import GlobalNavbarSearchBar from "@/components/general/shell/GlobalShellNavbar/search-bar/GlobalShellNavbarSearchBar";
import { useUserRoles } from "@/components/auth/hooks/useUserRoles";
import { EUserRoles } from "@/components/auth/roles";
import { useLocalStorage } from "@mantine/hooks";
import dayjs from "dayjs";

interface NavbarItem {
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  label: string;
  href: string;
}

const links: NavbarItem[] = [
  { icon: IconRouteAltLeft, label: "Explore", href: "/explore" },
  { icon: IconUser, label: "Library", href: "/library" },
  { icon: IconCheckbox, label: "Achievements", href: "/achievements" },
  { icon: IconMessage2, label: "Posts", href: "/posts" },
  { icon: IconBulb, label: "Activity", href: "/activity" },
  { icon: IconRefresh, label: "Importer", href: "/importer" },
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
        <link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{link.label}</span>
      </Link>
    </UnstyledButton>
  ));

  const [knackMode, setKnackMode] = useLocalStorage({
    key: "KNACK_MODE",
    defaultValue: true,
    getInitialValueInEffect: true,
  });

  const isAprilFools = useMemo(() => dayjs().isSame("2025-04-01", "day"), []);

  return (
    <nav className={classes.navbar}>
      {isLoggedIn && userProfile && (
        <div className={classes.section}>
          <Link href={`/profile/${userProfile.userId}`} onClick={onClose}>
            <UserButton userId={userProfile.userId} />
          </Link>
        </div>
      )}

      <Box w={"100%"} my={"0.8rem"}>
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

      <div className={classes.section}>
        <div className={classes.mainLinks}>
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
      {isAprilFools && (
        <Switch
          label={"KNACK 2 MODE"}
          checked={knackMode}
          onChange={(evt) => {
            setKnackMode(evt.target.checked);
          }}
          size={"md"}
        />
      )}
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
    </nav>
  );
}
