import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer.tsx";
import { Text } from "@mantine/core";
import { UnmappedExternalGamesTable } from "@/components/external_game/UnmappedExternalGamesTable.tsx";

const UnmappedExternalGamesTablePage = () => {
  return (
    <PageContainer title={"Unmapped External Games"}>
      <Text c={"dimmed"}>
        During Importer system&#39;s processing, no internal matches for these
        games were found. This means these games won&#39;t show up in the
        importer page for users, and playtime info will not be imported for
        them. You may manually add a match from one of the items below, or at
        any time by clicking the submit button.
      </Text>
      <UnmappedExternalGamesTable />
    </PageContainer>
  );
};

export default UnmappedExternalGamesTablePage;
