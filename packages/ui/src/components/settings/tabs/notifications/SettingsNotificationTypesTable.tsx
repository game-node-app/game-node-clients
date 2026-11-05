import { Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconLock } from "@tabler/icons-react";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsLockedSwitch } from "#@/components/settings/tabs/notifications/SettingsLockedSwitch";

type NotificationChannel = "inApp" | "push" | "email";

/** "on"/"off": switch; "always": cannot be turned off; "none": not sent on that channel. */
type NotificationCellState = "on" | "off" | "always" | "none";

type NotificationTypeKey =
  | "followers"
  | "likes"
  | "comments"
  | "mentions"
  | "games"
  | "imports"
  | "news"
  | "account"
  | "premium";

const CHANNELS: NotificationChannel[] = ["inApp", "push", "email"];

/**
 * Today every type is delivered in the app and nothing else, so this reflects the
 * current behavior. There is no preferences API yet: every control is read-only.
 */
const NOTIFICATION_TYPES: {
  key: NotificationTypeKey;
  cells: Record<NotificationChannel, NotificationCellState>;
}[] = [
  { key: "followers", cells: { inApp: "on", push: "off", email: "none" } },
  { key: "likes", cells: { inApp: "on", push: "off", email: "none" } },
  { key: "comments", cells: { inApp: "on", push: "off", email: "none" } },
  { key: "mentions", cells: { inApp: "on", push: "off", email: "none" } },
  { key: "games", cells: { inApp: "on", push: "off", email: "none" } },
  { key: "imports", cells: { inApp: "on", push: "off", email: "none" } },
  { key: "news", cells: { inApp: "on", push: "off", email: "none" } },
  {
    key: "account",
    cells: { inApp: "always", push: "always", email: "none" },
  },
  {
    key: "premium",
    cells: { inApp: "always", push: "always", email: "none" },
  },
];

/** Column width on wide panels; below the container breakpoint each row stacks. */
const CELL_CLASSNAME =
  "flex items-center gap-2 @[480px]:w-[76px] @[480px]:shrink-0 @[480px]:justify-center";

function NotificationCell({
  state,
  label,
}: {
  state: NotificationCellState;
  label: string;
}) {
  const { t } = useTranslation();

  switch (state) {
    case "on":
    case "off":
      return <SettingsLockedSwitch label={label} checked={state === "on"} />;
    case "always":
      return (
        <Group gap={4} wrap={"nowrap"} className={"text-[#7a7a7a]"}>
          <IconLock size={12} aria-hidden />
          <Text component={"span"} fz={12} lh={"normal"} c={"inherit"}>
            {t("settings.notifications.types.always")}
          </Text>
        </Group>
      );
    case "none":
      return (
        <Text
          component={"span"}
          fz={12}
          lh={"normal"}
          className={"text-[#7a7a7a]"}
        >
          <span aria-hidden>—</span>
          <span className={"sr-only"}>
            {t("settings.notifications.types.unavailable")}
          </span>
        </Text>
      );
  }
}

/** Type × channel matrix of the notifications tab (Figma "Card / Tipo × canal"). */
export function SettingsNotificationTypesTable() {
  const { t } = useTranslation();

  const channelLabels: Record<NotificationChannel, string> = {
    inApp: t("settings.notifications.types.columns.inApp"),
    push: t("settings.notifications.types.columns.push"),
    email: t("settings.notifications.types.columns.email"),
  };

  return (
    <Box className={"@container w-full"}>
      <SettingsCard withDividers={false}>
        <Box
          className={
            "hidden items-center border-0 border-b border-solid border-[#2a2a2a] px-5 py-3 @[480px]:flex"
          }
        >
          <Text
            fz={12}
            lh={"normal"}
            className={"min-w-0 flex-1 text-[#7a7a7a]"}
          >
            {t("settings.notifications.types.columns.type")}
          </Text>
          {CHANNELS.map((channel) => (
            <Text
              key={channel}
              fz={12}
              lh={"normal"}
              ta={"center"}
              className={"w-[76px] shrink-0 text-[#7a7a7a]"}
            >
              {channelLabels[channel]}
            </Text>
          ))}
        </Box>
        {NOTIFICATION_TYPES.map(({ key, cells }) => {
          const title = t(`settings.notifications.types.items.${key}.title`);

          return (
            <Box
              key={key}
              className={
                "flex flex-col gap-3 border-0 border-solid border-[#2a2a2a] px-5 py-3.5 [&+&]:border-t @[480px]:flex-row @[480px]:items-center @[480px]:gap-0"
              }
            >
              <Stack gap={4} className={"min-w-0 flex-1"}>
                <Text fz={14} fw={600} c={"white"} lh={"normal"}>
                  {title}
                </Text>
                <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
                  {t(`settings.notifications.types.items.${key}.description`)}
                </Text>
              </Stack>
              <Box
                className={
                  "flex flex-wrap items-center gap-x-5 gap-y-2 @[480px]:flex-nowrap @[480px]:gap-0"
                }
              >
                {CHANNELS.map((channel) => (
                  <Box key={channel} className={CELL_CLASSNAME}>
                    <Text
                      component={"span"}
                      fz={12}
                      lh={"normal"}
                      aria-hidden
                      className={"text-[#7a7a7a] @[480px]:hidden"}
                    >
                      {channelLabels[channel]}
                    </Text>
                    <NotificationCell
                      state={cells[channel]}
                      label={`${title} · ${channelLabels[channel]}`}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </SettingsCard>
    </Box>
  );
}
