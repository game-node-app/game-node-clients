import { Button, ButtonProps } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconShare } from "@tabler/icons-react";
import {
  buildDailyShareText,
  DAILY_SHARE_URL,
  DailyShareEntry,
} from "#@/components/daily/util/buildDailyShareText";
import { createErrorNotification } from "#@/util/createErrorNotification";
import { useShareText } from "#@/context/UIProvider";

interface Props extends Pick<ButtonProps, "variant" | "fullWidth"> {
  entries: DailyShareEntry[];
  label?: string;
}

const DailyShareButton = ({ entries, label, variant, fullWidth }: Props) => {
  const { t } = useTranslation();
  const shareText = useShareText();

  const share = async () => {
    const text = buildDailyShareText(entries, DAILY_SHARE_URL);
    try {
      return await shareText(text);
    } catch {
      // sharing isn't available here; fall back to the clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      notifications.show({ message: t("daily.share.copied") });
    } catch (error) {
      createErrorNotification(error as Error);
    }
  };

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      leftSection={<IconShare size={18} />}
      onClick={share}
    >
      {label ?? t("actions.share")}
    </Button>
  );
};

export { DailyShareButton };
