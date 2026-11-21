import React from "react";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { useRouter } from "next/router";
import { ActionIcon, Anchor, Button, Group, Image, Paper } from "@mantine/core";
import { useLocalStorage, useMounted } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { useAppExperience } from "@repo/ui";
import { IconX } from "@tabler/icons-react";
import { getAndroidAppUrl, GOOGLE_PLAY_URL } from "./getAndroidAppUrl";

/** Height of the console experience's fixed bottom navigation. */
const CONSOLE_BOTTOM_NAV_HEIGHT = 60;

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

  if (!mounted || !onMobile || dismissed) {
    return null;
  }

  const appUrl = getAndroidAppUrl(
    new URL(window.location.href),
    router.pathname,
    navigator.userAgent,
  );
  if (!appUrl) return null;

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
        <Button component="a" href={appUrl} h={40}>
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
