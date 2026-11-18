import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ItemDropdown } from "#@/components/general/input/ItemDropdown";
import { ReportCreateFormModal } from "#@/components/report/modal/ReportCreateFormModal";
import { ProfileFollowActions } from "#@/components/profile/view/ProfileFollowActions";
import { useSettingsModalState } from "#@/components/settings/hooks/useSettingsModalState";
import { Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { CreateReportRequestDto } from "@repo/wrapper/server";

const ProfileAvatarSectionButtons = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const settings = useSettingsModalState();
  const [reportOpened, report] = useDisclosure();

  if (ownUserId === userId) {
    return (
      <Button
        variant="outline"
        radius="md"
        size="md"
        className="w-full sm:w-auto sm:min-w-44"
        onClick={() => settings.open("profile", "images")}
      >
        {t("settings.tabs.profile.label")}
      </Button>
    );
  }

  return (
    <Group
      wrap="nowrap"
      align="flex-start"
      gap="xs"
      className="w-full sm:w-auto"
    >
      <ProfileFollowActions targetUserId={userId} />
      <ItemDropdown>
        <ItemDropdown.ReportButton onClick={report.open} />
      </ItemDropdown>
      {reportOpened && (
        <ReportCreateFormModal
          opened={reportOpened}
          onClose={report.close}
          sourceId={userId}
          sourceType={CreateReportRequestDto.sourceType.PROFILE}
        />
      )}
    </Group>
  );
};

export { ProfileAvatarSectionButtons };
