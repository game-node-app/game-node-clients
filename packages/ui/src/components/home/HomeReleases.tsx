import { SimpleGrid, Stack } from "@mantine/core";
import { FindGamesByCollectionTypeRequestDto } from "@repo/wrapper/server";
import { GameCollectionTypeView } from "#@/components/game/collection/GameCollectionTypeView";
import { ConsoleReleaseCalendar } from "#@/components/theme/console/ConsoleReleaseCalendar";
import { buildPresenterComponent } from "#@/context";
import CollectionType = FindGamesByCollectionTypeRequestDto.collectionType;

/** Home block with this month's release calendar, then upcoming and recently released games. */
const DEFAULT_HomeReleases = () => (
  <Stack className={"w-full"} gap={"lg"}>
    <ConsoleReleaseCalendar />
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
