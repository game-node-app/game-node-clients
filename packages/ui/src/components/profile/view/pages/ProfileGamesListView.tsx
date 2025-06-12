import React from "react";
import { Button, Center, Stack } from "@mantine/core";
import { RecentCollectionEntriesView } from "#@/components";
import { Link } from "#@/util";

interface Props {
  userId: string;
}

const ProfileGamesListView = ({ userId }: Props) => {
  return (
    <Stack className={"w-full"}>
      <RecentCollectionEntriesView userId={userId} limit={15} />
      <Center>
        <Link href={`/library/${userId}`}>
          <Button>View More</Button>
        </Link>
      </Center>
    </Stack>
  );
};

export { ProfileGamesListView };
