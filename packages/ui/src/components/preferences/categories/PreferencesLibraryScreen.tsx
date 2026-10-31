import { DetailsBox, PreferredPlatformsView } from "#@/components";
import { Stack } from "@mantine/core";
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