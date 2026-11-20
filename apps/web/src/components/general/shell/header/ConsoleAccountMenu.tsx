import { AccountMenuItem } from "@/components/general/shell/navbar/AccountMenuItem";
import { GAMENODE_ANDROID_URL } from "@/components/general/shell/navbar/dockItems";
import { Button, Menu, UnstyledButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  cn,
  NavDownloadIcon,
  NavLogoutIcon,
  NavPaletteIcon,
  NavSettingsIcon,
  useSettingsModalState,
  UserAvatar,
  useUserLevel,
  useUserProfile,
  useUserId,
} from "@repo/ui";
import Link from "next/link";

interface Props {
  className?: string;
}

/**
 * Console header account block: avatar, username and level for a signed-in
 * user, or the sign-in button for a visitor. The dropdown keeps the same
 * account actions as the Dock (`SettingsModal`, appearance, downloads and
 * sign out).
 */
export function ConsoleAccountMenu({ className }: Props) {
  const userId = useUserId();

  if (!userId) {
    return (
      <Button
        component={Link}
        href="/auth"
        size="sm"
        radius="sm"
        variant="filled"
        className={className}
      >
        <SignInLabel />
      </Button>
    );
  }

  return <SignedInAccountMenu userId={userId} className={className} />;
}

function SignInLabel() {
  const { t } = useTranslation();
  return <>{t("auth.signIn")}</>;
}

function SignedInAccountMenu({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const settings = useSettingsModalState();
  const compact = useMediaQuery("(max-width: 61.99em)");
  const { data: profile } = useUserProfile(userId);
  const { data: level } = useUserLevel(userId);

  const levelLabel = t("user.labels.level", {
    level: level?.currentLevel ?? 1,
  });

  const identity = (showUsername: boolean) => (
    <span className="flex min-w-0 items-center gap-2">
      <UserAvatar userId={userId} size={32} radius="xl" className="shrink-0" />
      {showUsername && (
        <span className="flex min-w-0 flex-col text-left leading-tight">
          <span className="max-w-[140px] truncate text-[13px] font-semibold text-nav-text">
            {profile?.username ?? t("navigation.account.caption")}
          </span>
          <span className="truncate text-[11px] font-normal text-nav-muted">
            {levelLabel}
          </span>
        </span>
      )}
    </span>
  );

  return (
    <Menu
      position={compact ? "bottom-start" : "bottom-end"}
      offset={8}
      width={232}
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
          aria-label={t("navigation.account.caption")}
          className={cn(
            "flex min-w-0 items-center rounded-md p-1",
            "hover:bg-nav-raised focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-focus",
            className,
          )}
        >
          {identity(true)}
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown className="flex min-w-[232px] flex-col gap-1 rounded-md border border-nav-border bg-nav-surface p-2">
        <Menu.Item
          component={Link}
          href={`/profile/${userId}`}
          className="flex min-h-12 items-center rounded-md px-2 hover:bg-nav-raised focus:bg-nav-raised focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-focus"
        >
          {identity(true)}
        </Menu.Item>
        <div aria-hidden="true" className="h-px w-full bg-nav-border" />
        <AccountMenuItem
          label={t("navigation.account.settings")}
          icon={NavSettingsIcon}
          onClick={() => settings.open("profile")}
        />
        <AccountMenuItem
          label={t("navigation.account.themes")}
          icon={NavPaletteIcon}
          onClick={() => settings.open("appearance")}
        />
        <AccountMenuItem
          label={t("navigation.account.downloads")}
          icon={NavDownloadIcon}
          href={GAMENODE_ANDROID_URL}
          target="_blank"
        />
        <div aria-hidden="true" className="h-px w-full bg-nav-border" />
        <AccountMenuItem
          label={t("navigation.account.logout")}
          icon={NavLogoutIcon}
          tone="danger"
          href="/auth/logout"
        />
      </Menu.Dropdown>
    </Menu>
  );
}
