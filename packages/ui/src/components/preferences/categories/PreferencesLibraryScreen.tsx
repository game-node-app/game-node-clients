import React from "react";
import { Stack } from "@mantine/core";
import { DetailsBox, PreferredPlatformsView } from "#@/components";
import { useTranslation } from "@repo/locales";

const PreferencesLibraryScreen = () => {
  const { t } = useTranslation();

  return (
    <Stack>
      <DetailsBox title={t("preferences.labels.preferredPlatforms")}>
        <PreferredPlatformsView />
      </DetailsBox>
    </Stack>
  );
};

export { PreferencesLibraryScreen };
