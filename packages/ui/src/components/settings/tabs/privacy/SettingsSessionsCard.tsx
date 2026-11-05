import { Group, Skeleton, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconLock,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { authClient } from "#@/components/auth/authClient";
import { signOut } from "#@/components/auth/signOut";
import { ActionConfirm } from "#@/components/general/ActionConfirm";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsPill } from "#@/components/settings/common/SettingsPill";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import {
  AuthClientError,
  AuthSession,
  SESSION_NOT_FRESH_CODE,
  useAuthSessions,
} from "#@/components/settings/hooks/useAuthSessions";
import {
  useRevokeOtherSessions,
  useRevokeSession,
} from "#@/components/settings/hooks/useRevokeSession";
import {
  parseSessionUserAgent,
  SessionDevice,
} from "#@/components/settings/tabs/privacy/parseSessionUserAgent";
import { useRouter } from "#@/util";

const DEVICE_ICONS = {
  desktop: IconDeviceDesktop,
  mobile: IconDeviceMobile,
  tablet: IconDeviceTablet,
} as const;

/** A session touched in the last few minutes is shown as "Active now". */
const ACTIVE_NOW_MINUTES = 5;

/** Device name ("Chrome on Windows") and last activity, localized. */
function useSessionLabels() {
  const { t, i18n } = useTranslation();

  const getDeviceLabel = (device: SessionDevice) => {
    const { isApp, browser, os } = device;
    if (isApp) {
      return os
        ? t("settings.privacy.sessions.device.appOnOs", { os })
        : t("settings.privacy.sessions.device.app");
    }
    if (browser && os) {
      return t("settings.privacy.sessions.device.browserOnOs", { browser, os });
    }
    if (browser) return browser;
    if (os) return t("settings.privacy.sessions.device.osOnly", { os });
    return t("settings.privacy.sessions.device.unknown");
  };

  const getLastActiveLabel = (date: Date) => {
    const now = dayjs();
    const lastActive = dayjs(date);
    const minutes = now.diff(lastActive, "minute");
    if (minutes < ACTIVE_NOW_MINUTES) {
      return t("settings.privacy.sessions.activeNow");
    }

    const days = now.diff(lastActive, "day");
    if (days >= 7) {
      const formatted = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "short",
      }).format(lastActive.toDate());
      return t("settings.privacy.sessions.lastActiveDate", { date: formatted });
    }

    const relative = new Intl.RelativeTimeFormat(i18n.language, {
      numeric: "auto",
    });
    const hours = now.diff(lastActive, "hour");
    const time =
      hours < 1
        ? relative.format(-minutes, "minute")
        : days < 1
          ? relative.format(-hours, "hour")
          : relative.format(-days, "day");
    return t("settings.privacy.sessions.lastActiveRelative", { time });
  };

  return { getDeviceLabel, getLastActiveLabel };
}

function SessionSkeletonRow() {
  return (
    <Group wrap={"nowrap"} gap={16} className={"px-5 py-4"}>
      <Skeleton h={36} w={36} radius={10} />
      <Stack gap={8} className={"flex-1"}>
        <Skeleton h={12} w={"40%"} />
        <Skeleton h={10} w={"25%"} />
      </Stack>
    </Group>
  );
}

/** Active sessions (devices) with "sign out" per device and for all others. */
export function SettingsSessionsCard() {
  const { t } = useTranslation();
  const { getDeviceLabel, getLastActiveLabel } = useSessionLabels();
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentSessionId = authClient.useSession().data?.session.id;
  const sessionsQuery = useAuthSessions();
  const revokeSession = useRevokeSession();
  const revokeOtherSessions = useRevokeOtherSessions();
  const [revoking, setRevoking] = useState<AuthSession>();
  const [confirmOthers, setConfirmOthers] = useState(false);

  const isNotFresh =
    (sessionsQuery.error as AuthClientError | null)?.code ===
    SESSION_NOT_FRESH_CODE;

  // Current session first, then the most recently used.
  const sessions = [...(sessionsQuery.data ?? [])].sort((a, b) => {
    if (a.id === currentSessionId) return -1;
    if (b.id === currentSessionId) return 1;
    return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
  });
  const hasOtherSessions = sessions.some((s) => s.id !== currentSessionId);

  const revokingLabel =
    revoking && getDeviceLabel(parseSessionUserAgent(revoking.userAgent));

  return (
    <>
      <SettingsCard>
        {sessionsQuery.isLoading && <SessionSkeletonRow />}
        {sessionsQuery.isLoading && <SessionSkeletonRow />}
        {isNotFresh && (
          <SettingsRow
            Icon={IconLock}
            title={t("settings.privacy.sessions.notFresh.title")}
            description={t("settings.privacy.sessions.notFresh.description")}
            rightSection={
              <SettingsButton
                variant={"secondary"}
                onClick={async () => {
                  await signOut(queryClient);
                  void router.push("/auth");
                }}
              >
                {t("settings.privacy.sessions.notFresh.action")}
              </SettingsButton>
            }
          />
        )}
        {sessionsQuery.isError && !isNotFresh && (
          <Text fz={13} className={"px-5 py-4 text-[#ff6369]"}>
            {t("settings.privacy.sessions.error")}
          </Text>
        )}
        {sessions.map((session) => {
          const device = parseSessionUserAgent(session.userAgent);
          const isCurrent = session.id === currentSessionId;
          return (
            <SettingsRow
              key={session.id}
              Icon={DEVICE_ICONS[device.kind]}
              title={getDeviceLabel(device)}
              description={
                isCurrent
                  ? t("settings.privacy.sessions.activeNow")
                  : getLastActiveLabel(new Date(session.updatedAt))
              }
              rightSection={
                isCurrent ? (
                  <SettingsPill tone={"success"} withDot>
                    {t("settings.privacy.sessions.current")}
                  </SettingsPill>
                ) : (
                  <SettingsButton
                    variant={"secondary"}
                    loading={
                      revokeSession.isPending &&
                      revokeSession.variables === session.token
                    }
                    onClick={() => setRevoking(session)}
                  >
                    {t("settings.privacy.sessions.revoke")}
                  </SettingsButton>
                )
              }
            />
          );
        })}
        <SettingsRow
          title={t("settings.privacy.sessions.revokeOthers.title")}
          description={t("settings.privacy.sessions.revokeOthers.description")}
          rightSection={
            <SettingsButton
              variant={"dangerOutline"}
              loading={revokeOtherSessions.isPending}
              // Without the list (not fresh / error) we can't tell, so keep it available.
              disabled={sessionsQuery.isSuccess && !hasOtherSessions}
              onClick={() => setConfirmOthers(true)}
            >
              {t("settings.privacy.sessions.revokeOthers.action")}
            </SettingsButton>
          }
        />
      </SettingsCard>
      <ActionConfirm
        opened={revoking != undefined}
        onClose={() => setRevoking(undefined)}
        title={t("settings.privacy.sessions.revokeTitle")}
        message={t("settings.privacy.sessions.revokeConfirm", {
          device: revokingLabel,
        })}
        onConfirm={() => {
          if (!revoking) return;
          revokeSession.mutate(revoking.token, {
            onSuccess: () =>
              notifications.show({
                color: "green",
                message: t("settings.privacy.sessions.revokeSuccess"),
              }),
          });
        }}
      />
      <ActionConfirm
        opened={confirmOthers}
        onClose={() => setConfirmOthers(false)}
        title={t("settings.privacy.sessions.revokeOthers.confirmTitle")}
        message={t("settings.privacy.sessions.revokeOthers.confirmMessage")}
        onConfirm={() =>
          revokeOtherSessions.mutate(undefined, {
            onSuccess: () =>
              notifications.show({
                color: "green",
                message: t("settings.privacy.sessions.revokeOthers.success"),
              }),
          })
        }
      />
    </>
  );
}
