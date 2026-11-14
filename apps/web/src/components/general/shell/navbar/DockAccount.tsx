import { AccountMenuItem } from "@/components/general/shell/navbar/AccountMenuItem";
import { GAMENODE_ANDROID_URL } from "@/components/general/shell/navbar/dockItems";
import { Menu, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  cn,
  NavDownloadIcon,
  NavLogoutIcon,
  NavPaletteIcon,
  NavSettingsIcon,
  useSettingsModalState,
  UserAvatar,
  useUserProfile,
  useUserId,
} from "@repo/ui";
import Link from "next/link";
import { useState } from "react";

interface Props {
  collapsed: boolean;
  onNavigate?: () => void;
}

/**
 * Navigation/Account plus the account menu (design nodes 5192:2102 and
 * 5206:19210). Renders nothing for visitors: the Topbar owns the "Sign in"
 * affordance, while this block always represents a signed-in account.
 */
export function DockAccount({ collapsed, onNavigate }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();
  const { data: profile } = useUserProfile(userId);
  const settings = useSettingsModalState();
  const [opened, setOpened] = useState(false);

  if (!userId) {
    return null;
  }

  const closeMenu = () => setOpened(false);

  const handleLinkClick = () => {
    closeMenu();
    onNavigate?.();
  };

  const closeAndRun = (action: () => void) => {
    closeMenu();
    action();
    onNavigate?.();
  };

  const accountSummary = (caption: string, showText = !collapsed) => (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <UserAvatar userId={userId} size={32} radius="xl" className="shrink-0" />
      {showText && (
        <div className="flex min-w-0 flex-col text-left">
          <span className="truncate text-[14px] font-semibold leading-[normal] text-nav-text">
            {profile?.username}
          </span>
          <span className="truncate text-[12px] font-normal leading-[normal] text-nav-muted">
            {caption}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="right-end"
      offset={8}
      withinPortal
      closeOnItemClick
    >
      <Menu.Target>
        <UnstyledButton
          aria-label={t("navigation.account.caption")}
          className={cn(
            "flex h-[52px] w-full items-center gap-3 rounded-md border px-2",
            "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-brand-5",
            collapsed && "justify-center",
            opened
              ? "border-nav-border bg-nav-raised"
              : "border-transparent hover:bg-nav-raised",
          )}
        >
          {accountSummary(t("navigation.account.caption"))}
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown className="flex w-[232px] flex-col gap-1 rounded-md border border-nav-border bg-nav-surface p-2">
        <Menu.Item
          component={Link}
          href={`/profile/${userId}`}
          onClick={handleLinkClick}
          className="flex h-[52px] items-center rounded-md px-2 hover:bg-nav-raised focus:bg-nav-raised focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-brand-5"
        >
          {accountSummary(t("navigation.account.viewProfile"), true)}
        </Menu.Item>
        <div aria-hidden="true" className="h-px w-full bg-nav-border" />
        <AccountMenuItem
          label={t("navigation.account.settings")}
          icon={NavSettingsIcon}
          onClick={() => closeAndRun(() => settings.open("profile"))}
        />
        <AccountMenuItem
          label={t("navigation.account.themes")}
          icon={NavPaletteIcon}
          onClick={() => closeAndRun(() => settings.open("appearance"))}
        />
        <AccountMenuItem
          label={t("navigation.account.downloads")}
          icon={NavDownloadIcon}
          href={GAMENODE_ANDROID_URL}
          target="_blank"
          onClick={handleLinkClick}
        />
        <div aria-hidden="true" className="h-px w-full bg-nav-border" />
        <AccountMenuItem
          label={t("navigation.account.logout")}
          icon={NavLogoutIcon}
          tone="danger"
          href="/auth/logout"
          onClick={handleLinkClick}
        />
      </Menu.Dropdown>
    </Menu>
  );
}
