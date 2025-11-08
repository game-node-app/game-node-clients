import React from "react";
import { Stack } from "@mantine/core";
import { DetailsBox, PreferredPlatformsView } from "#@/components";

const PreferencesLibraryScreen = () => {
  return (
    <Stack>
      <DetailsBox title={"Preferred Platforms"}>
        <PreferredPlatformsView />
      </DetailsBox>
    </Stack>
  );
};

export { PreferencesLibraryScreen };
