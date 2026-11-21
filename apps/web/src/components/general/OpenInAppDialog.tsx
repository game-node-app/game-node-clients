import React from "react";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { useRouter } from "next/router";
import { ActionIcon, Anchor, Button, Group, Image, Paper } from "@mantine/core";
import { useLocalStorage, useMounted } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { useAppExperience } from "@repo/ui";
import { IconX } from "@tabler/icons-react";

const EXCLUDED_ROUTES = [
  "/",
  "/about",
  "/premium",
  "/tos",
  "/privacy",
  "/auth",
  "/oauth/consent",
  "/connections/callback/[type]",
];

const ANDROID_PACKAGE = "app.gamenode";
const GOOGLE_PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}&pcampaignid=web_share`;
/** Height of the console experience's fixed bottom navigation. */
const CONSOLE_BOTTOM_NAV_HEIGHT = 60;

/**
 * Builds an Android intent URL that opens the current page in the app (the app
 * claims https://gamenode.app links) and falls back to Google Play when the app
 * is not installed.
 */
function getAndroidIntentUrl(): string {
  const { protocol, host, pathname, search, hash } = window.location;
  return `intent://${host}${pathname}${search}${hash}#Intent;scheme=${protocol.replace(":", "")};package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)};end`;
}

/**
 * Compact banner that suggests the Android app to mobile visitors. Dismissal is
 * remembered across sessions.
 * @constructor
 */
const OpenInAppDialog = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const onMobile = useOnMobile();
  const experience = useAppExperience();

  /**
   * 'useOnMobile' returns true by default for SSR, so nothing is shown until
   * the component mounted and the media query was resolved on the client.
   */
  const mounted = useMounted();

  const [dismissed, setDismissed] = useLocalStorage({
    key: "open-in-app-dialog-closed",
    defaultValue: false,
    getInitialValueInEffect: true,
  });

  if (
    !mounted ||
    !onMobile ||
    dismissed ||
    EXCLUDED_ROUTES.includes(router.pathname)
  ) {
    return null;
  }

  const appUrl = /Android/i.test(navigator.userAgent)
    ? getAndroidIntentUrl()
    : window.location.href;

  return (
    <Paper
      component="aside"
      aria-label={t("app.betterInApp")}
      withBorder
      shadow="md"
      radius="md"
      p="sm"
      className="fixed inset-x-3 z-[150]"
      style={{
        bottom: `calc(12px + env(safe-area-inset-bottom) + ${
          experience === "console" ? CONSOLE_BOTTOM_NAV_HEIGHT : 0
        }px)`,
      }}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start" gap="xs">
        <div className="text-sm font-semibold leading-snug pt-2">
          {t("app.betterInApp")}
        </div>
        <ActionIcon
          variant="subtle"
          color="gray"
          size={40}
          aria-label={t("app.closeBanner")}
          onClick={() => setDismissed(true)}
          className="-mt-1 -mr-1 shrink-0"
        >
          <IconX size={18} />
        </ActionIcon>
      </Group>
      <Group gap="sm" mt={4}>
        <Button
          component="a"
          href={appUrl}
          h={40}
          onClick={() => setDismissed(true)}
        >
          {t("app.openInApp")}
        </Button>
        <Anchor href={GOOGLE_PLAY_URL} className="block h-10 shrink-0">
          <Image
            src={"/img/google_play_badge_english.png"}
            alt={t("app.googlePlayAlt")}
            h={40}
            w="auto"
          />
        </Anchor>
      </Group>
    </Paper>
  );
};

export default OpenInAppDialog;
