import { AppPage } from "@/components/general/AppPage";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { ActivityDetailView, useActivity, useUserProfile } from "@repo/ui";

interface Props {
  activityId: string;
}

const ActivityDetailPage = ({ activityId }: Props) => {
  const { t } = useTranslation();
  const activityQuery = useActivity(activityId);
  const profileQuery = useUserProfile(activityQuery.data?.profileUserId);

  return (
    <AppPage>
      <Stack className={"w-full h-full mb-8"}>
        {(activityQuery.isError || profileQuery.isError) && (
          <CenteredErrorMessage
            message={t("errors.fetchFailed", {
              resource: t("navigation.activity"),
            })}
          />
        )}
        <ActivityDetailView activityId={activityId} />
      </Stack>
    </AppPage>
  );
};

export default ActivityDetailPage;