import React from "react";
import { Center, Stack } from "@mantine/core";
import { ActivityList } from "#@/components/activity/ActivityList";
import { useActivity } from "#@/components/activity/hooks/useActivity";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { TextLink } from "#@/components/general/TextLink";
import { useTranslation } from "@repo/locales";

interface Props {
  activityId: string;
}

const ActivityDetailView = ({ activityId }: Props) => {
  const { t } = useTranslation();
  const activityQuery = useActivity(activityId);
  const profileQuery = useUserProfile(activityQuery.data?.profileUserId);

  if (activityQuery.isLoading || profileQuery.isLoading) {
    return <CenteredLoading message={t("common.loading")} />;
  } else if (activityQuery.isError || profileQuery.isError) {
    return (
      <CenteredErrorMessage
        message={t("errors.fetchFailed", {
          resource: t("navigation.activity").toLowerCase(),
        })}
      />
    );
  } else if (activityQuery.data == undefined) {
    return null;
  }

  return (
    <Stack className={"w-full"}>
      <DetailsBox
        title={t("profile.titles.activity", {
          username: profileQuery.data?.username,
        })}
        stackProps={{
          className: "",
        }}
      >
        <ActivityList items={[activityQuery.data]} />
      </DetailsBox>
      <Center>
        <TextLink href={"/activity/all"}>{t("actions.seeMore")} </TextLink>
      </Center>
    </Stack>
  );
};

export { ActivityDetailView };
