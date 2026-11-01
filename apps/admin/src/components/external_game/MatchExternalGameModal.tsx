import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  ExternalGameService,
  SubmitExternalGameDto,
  UnmappedExternalGame,
} from "@repo/wrapper/server";
import {
  createErrorNotification,
  GameFigureImage,
  GameSearchSelectModal,
  useGame,
} from "@repo/ui";
import { getExternalLookupUrl } from "@/components/external_game/utils/getExternalLookupUrl";
import { getExternalSourceName } from "@/components/external_game/utils/getExternalSourceName";

interface Props {
  item: UnmappedExternalGame;
  opened: boolean;
  onClose: () => void;
}

const MatchExternalGameModal = ({ item, opened, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [searchOpened, searchUtils] = useDisclosure();
  const [gameId, setGameId] = useState<number>();
  const [sourceUrl, setSourceUrl] = useState(getExternalLookupUrl(item) ?? "");
  const gameQuery = useGame(gameId, { relations: { cover: true } });
  const isUrlValid = URL.canParse(sourceUrl);

  const matchMutation = useMutation({
    mutationFn: () =>
      ExternalGameService.externalGameControllerSubmitExternalGameV1({
        sourceId: item.sourceUid,
        sourceUrl,
        gameId: gameId!,
        category: item.category as unknown as SubmitExternalGameDto.category,
      }),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Match submitted." });
      void queryClient.invalidateQueries({
        queryKey: ["game", "external", "unmapped"],
      });
      onClose();
    },
    onError: (err) => {
      // 409 is rendered inline below.
      if (!(err instanceof ApiError && err.status === 409)) {
        createErrorNotification(err);
      }
    },
  });

  const isConflict =
    matchMutation.error instanceof ApiError &&
    matchMutation.error.status === 409;

  return (
    <Modal opened={opened} onClose={onClose} title="Match external game">
      <Stack>
        <Group>
          <Badge variant="light">{getExternalSourceName(item.category)}</Badge>
          <Text ff="monospace">{item.sourceUid}</Text>
        </Group>
        <Button variant="default" onClick={searchUtils.open}>
          {gameId ? "Change game" : "Choose game"}
        </Button>
        <GameSearchSelectModal
          opened={searchOpened}
          onClose={searchUtils.close}
          onSelected={(id) => {
            setGameId(id);
            searchUtils.close();
          }}
        />
        {gameQuery.data && (
          <Group wrap="nowrap">
            <div className="w-20">
              <GameFigureImage game={gameQuery.data} />
            </div>
            <Text fw={500}>{gameQuery.data.name}</Text>
          </Group>
        )}
        <TextInput
          label="Source URL"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.currentTarget.value)}
          error={isUrlValid ? undefined : "Enter a valid URL."}
        />
        {isConflict && (
          <Alert color="yellow">
            IGDB already maps this ID, so it can&#39;t be matched manually.
          </Alert>
        )}
        <Button
          loading={matchMutation.isPending}
          disabled={!gameId || !isUrlValid}
          onClick={() => matchMutation.mutate()}
        >
          Submit match
        </Button>
      </Stack>
    </Modal>
  );
};

export { MatchExternalGameModal };
