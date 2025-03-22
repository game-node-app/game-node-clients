import React from "react";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import {
  Accordion,
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { CollectionCreateOrUpdateModal, useUserId } from "#@/components";
import { IconPlus } from "@tabler/icons-react";
import { LibraryViewSidebarCollection } from "#@/components/library/view/sidebar/LibraryViewSidebarCollection.tsx";
import { Link } from "#@/util";
import { useDisclosure } from "@mantine/hooks";

interface ILibraryViewSidebarProps {
  userId: string | undefined;
}

const LibraryViewSidebar = ({ userId }: ILibraryViewSidebarProps) => {
  const ownUserId = useUserId();
  const userProfileQuery = useUserProfile(userId);
  const username = userProfileQuery.data?.username;
  const isOwnLibrary = ownUserId != undefined && ownUserId === userId;

  const [collectionCreateModalOpened, collectionCreateModalUtils] =
    useDisclosure();

  if (!userId) return null;

  return (
    <nav>
      <CollectionCreateOrUpdateModal
        collectionId={undefined}
        opened={collectionCreateModalOpened}
        onClose={collectionCreateModalUtils.close}
      />
      <Paper className={"bg-[#42424233] p-5"}>
        <Stack className={"w-full"}>
          <Group className={"justify-between flex-nowrap"}>
            <Link href={`/library/${userId}`}>
              <Title size={"h5"}>{username}&apos;s library</Title>
            </Link>
            {isOwnLibrary && (
              <ActionIcon
                variant={"default"}
                className={"rounded-sm"}
                onClick={collectionCreateModalUtils.open}
              >
                <IconPlus size={"1rem"} />
              </ActionIcon>
            )}
          </Group>
          <Stack className={""}>
            <Accordion variant={"default"} defaultValue={"featured"}>
              <LibraryViewSidebarCollection userId={userId} type={"all"} />
              <LibraryViewSidebarCollection userId={userId} type={"featured"} />
            </Accordion>
          </Stack>
          {isOwnLibrary && (
            <Link href={"/importer"} className={"w-full"}>
              <Button className={"w-full"}>Import games</Button>
            </Link>
          )}
        </Stack>
      </Paper>
    </nav>
  );
};

export { LibraryViewSidebar };
