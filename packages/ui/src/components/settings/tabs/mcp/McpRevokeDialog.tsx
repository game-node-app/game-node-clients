import { Group, Kbd, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { SettingsButton } from "#@/components/settings/common";
import { McpAppTile } from "#@/components/settings/tabs/mcp/McpAppTile";
import { Modal } from "#@/util";

interface Props {
  opened: boolean;
  /** Name of the app being disconnected. */
  appName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation before revoking an app's access (Figma "Alertdialog / Revogar acesso"). */
export function McpRevokeDialog({
  opened,
  appName,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const title = t("settings.mcp.revoke.title", { app: appName });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={440}
      padding={0}
      radius={16}
      centered
      withCloseButton={false}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      aria-label={title}
      classNames={{
        content:
          "overflow-hidden border border-solid border-[#2a2a2a] bg-[#1a1a1a] shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]",
        body: "p-0",
      }}
    >
      <Stack gap={14} className={"px-6 pb-5 pt-6"}>
        <Group gap={12} wrap={"nowrap"}>
          <McpAppTile name={appName} size={40} />
          <Text
            component={"h2"}
            fz={20}
            fw={500}
            c={"white"}
            lh={"normal"}
            className={"m-0 min-w-0 flex-1 break-words"}
          >
            {title}
          </Text>
          <Kbd
            className={
              "shrink-0 border-[#2a2a2a] bg-[#222] px-1.5 py-0.5 text-[11px] font-medium text-[#adadad] max-sm:hidden"
            }
          >
            Esc
          </Kbd>
        </Group>
        <Text fz={14} lh={"normal"} className={"text-[#adadad]"}>
          {t("settings.mcp.revoke.description")}
        </Text>
      </Stack>
      <Group justify={"flex-end"} gap={8} className={"bg-[#0b0b0b] px-6 py-4"}>
        <SettingsButton
          variant={"secondary"}
          onClick={onClose}
          disabled={loading}
          data-autofocus
        >
          {t("actions.cancel")}
        </SettingsButton>
        <SettingsButton
          variant={"danger"}
          onClick={onConfirm}
          loading={loading}
        >
          {t("settings.mcp.apps.revoke")}
        </SettingsButton>
      </Group>
    </Modal>
  );
}
