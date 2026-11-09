import { getSupporterSettingsHref } from "#@/components/supporter/util/getSupporterSettingsHref";
import { Link } from "#@/util";
import { Paper, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

/**
 * Shown to a confirmed non-supporter inside the avatar/banner uploaders. It
 * never blocks image selection; it only points to the supporter screen.
 */
export function ProfileVideoSupporterNotice() {
  const { t } = useTranslation();

  return (
    <Paper
      withBorder
      radius={"md"}
      p={"md"}
      data-testid={"profile-video-supporter-notice"}
    >
      <Stack gap={4}>
        <Text fw={600}>{t("profileVideo.supporter.title")}</Text>
        <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
          {t("profileVideo.supporter.description")}
        </Text>
        <Link
          href={getSupporterSettingsHref()}
          className={"w-fit text-sm font-semibold text-brand-5"}
        >
          {t("profileVideo.supporter.link")}
        </Link>
      </Stack>
    </Paper>
  );
}
