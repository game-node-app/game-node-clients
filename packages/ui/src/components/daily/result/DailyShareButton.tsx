import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconShare } from "@tabler/icons-react";
import {
  buildDailyShareText,
  DailyShareEntry,
} from "#@/components/daily/util/buildDailyShareText";
import { createErrorNotification } from "#@/util/createErrorNotification";

interface Props {
  entries: DailyShareEntry[];
  label?: string;
}

const DailyShareButton = ({ entries, label }: Props) => {
  const { t } = useTranslation();

  const share = async () => {
    const text = buildDailyShareText(entries, "https://gamenode.app/daily");
    try {
      if (navigator.share) return await navigator.share({ text });
    } catch (error) {
      // the user closed the share sheet; other failures fall back to the clipboard
      if ((error as Error).name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(text);
      notifications.show({ message: t("daily.share.copied") });
    } catch (error) {
      createErrorNotification(error as Error);
    }
  };

  return (
    <Button leftSection={<IconShare size={18} />} onClick={share}>
      {label ?? t("actions.share")}
    </Button>
  );
};

export { DailyShareButton };
