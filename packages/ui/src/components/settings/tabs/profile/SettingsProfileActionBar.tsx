import { Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";

interface Props {
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

/**
 * "Unsaved changes / Discard / Save changes". Rendered only while something is
 * pending; sticks to the bottom of the panel so it stays reachable while scrolling.
 */
export function SettingsProfileActionBar({ saving, onDiscard, onSave }: Props) {
  const { t } = useTranslation();

  return (
    <Group
      gap={8}
      justify={"flex-end"}
      className={
        "sticky bottom-0 z-10 -mx-8 -mb-10 border-0 border-t border-solid border-[#2a2a2a] bg-[#0b0b0b] px-8 py-3 max-sm:-mx-4 max-sm:px-4"
      }
    >
      <Text
        fz={13}
        lh={"normal"}
        className={"text-[#f5a524]"}
        role={"status"}
        aria-live={"polite"}
      >
        {t("settings.profile.actions.unsaved")}
      </Text>
      <SettingsButton variant={"ghost"} disabled={saving} onClick={onDiscard}>
        {t("settings.profile.actions.discard")}
      </SettingsButton>
      <SettingsButton variant={"primary"} loading={saving} onClick={onSave}>
        {t("settings.profile.actions.save")}
      </SettingsButton>
    </Group>
  );
}
