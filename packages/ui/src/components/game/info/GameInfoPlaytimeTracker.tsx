import React, { useMemo } from "react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { ActionIcon, Button, Stack, Text } from "@mantine/core";
import { usePlaytimeForGame } from "#@/components/playtime/hooks/usePlaytimeForGame";
import { UserPlaytimeItem } from "#@/components/playtime/UserPlaytimeItem";
import { IconPlus } from "@tabler/icons-react";
import { Modal } from "#@/util";
import { useDisclosure } from "@mantine/hooks";
import { PlaytimeSubmitForm } from "#@/components/playtime/PlaytimeSubmitForm.tsx";

interface Props {
  gameId: number;
}

const GameInfoPlaytimeTracker = ({ gameId }: Props) => {
  const userId = useUserId();

  const [playtimeSubmitOpened, playtimeSubmitUtils] = useDisclosure();

  const playtimeQuery = usePlaytimeForGame(userId, gameId);

  const playtimes = playtimeQuery.data;

  const items = useMemo(() => {
    return playtimes?.map((playtime) => (
      <UserPlaytimeItem
        key={playtime.id}
        playtime={playtime}
        variant={"compact"}
      />
    ));
  }, [playtimes]);

  if (userId == undefined) {
    return null;
  }

  return (
    <DetailsBox
      title={"Your play sessions"}
      withBackground
      withPadding
      withDimmedTitle
    >
      <Modal
        opened={playtimeSubmitOpened}
        onClose={playtimeSubmitUtils.close}
        title={"Submit play session"}
      >
        <PlaytimeSubmitForm
          gameId={gameId}
          onClose={playtimeSubmitUtils.close}
        />
      </Modal>
      <Stack className={"w-full"}>
        {(playtimes == undefined || playtimes.length === 0) && (
          <Text className={"text-center text-sm"}>
            No play sessions found for this game. You can set up a connection or
            add your playtime info manually.
          </Text>
        )}
        {items}
        <Button variant={"default"} onClick={playtimeSubmitUtils.open}>
          Add Session
        </Button>
      </Stack>
    </DetailsBox>
  );
};

export { GameInfoPlaytimeTracker };
