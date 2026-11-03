import { SimpleGrid, Stack } from "@mantine/core";
import { FindGamesByCollectionTypeRequestDto } from "@repo/wrapper/server";
import { GameCollectionTypeView } from "#@/components/game/collection/GameCollectionTypeView";
import { ConsoleReleaseStrip } from "#@/components/theme/console/ConsoleReleaseStrip";
import { buildPresenterComponent } from "#@/context";
import CollectionType = FindGamesByCollectionTypeRequestDto.collectionType;

/** Home block with this week's release timeline (the month calendar opens from it), then upcoming and recently released games. */
const DEFAULT_HomeReleases = () => (
  <Stack className={"w-full"} gap={"lg"}>
    <ConsoleReleaseStrip />
    <SimpleGrid cols={{ base: 1, xs: 2 }} className={"w-full"}>
      <GameCollectionTypeView collectionType={CollectionType.UPCOMING} />
      <GameCollectionTypeView
        collectionType={CollectionType.RECENTLY_RELEASED}
      />
    </SimpleGrid>
  </Stack>
);

const HomeReleases = buildPresenterComponent(
  "HomeReleases",
  DEFAULT_HomeReleases,
);

export { HomeReleases };
