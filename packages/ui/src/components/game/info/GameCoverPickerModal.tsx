import { useState } from "react";
import {
  Alert,
  AspectRatio,
  Button,
  Center,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  Game,
  GameCoverImageDto,
  GameCoverOptionResponseDto,
} from "@repo/wrapper/server";
import { IconCheck, IconPhoto } from "@tabler/icons-react";
import { authClient } from "#@/components/auth/authClient";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { GAME_COVER_PLACEHOLDER } from "#@/components/game/hooks/useGameCoverImage";
import { useGameCoverChoice } from "#@/components/game/hooks/useGameCoverChoice";
import { useGameCoverOptions } from "#@/components/game/hooks/useGameCoverOptions";
import { useClearGameCoverChoice } from "#@/components/game/hooks/useClearGameCoverChoice";
import { useSetGameCoverChoice } from "#@/components/game/hooks/useSetGameCoverChoice";
import {
  ImageSize,
  getSizedImageUrl,
} from "#@/components/game/util/getSizedImageUrl";
import { normalizeGameCoverMode } from "#@/components/game/util/gameCoverRequest";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { cn } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { Modal } from "#@/util/modal";

interface GameCoverPickerModalProps extends BaseModalProps {
  game: Game;
}

/**
 * `getSizedImageUrl` returns a readable error for URLs that are not IGDB
 * images; the picker only applies it when it produced a usable URL.
 */
function getOptionImageSrc(image: GameCoverImageDto): string | undefined {
  if (!image.url) {
    return undefined;
  }

  const sized = getSizedImageUrl(image.url, ImageSize.COVER_BIG_2X);
  return sized?.startsWith("http") ? sized : image.url;
}

interface CoverTileProps {
  label: string;
  imageSrc?: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function CoverTile({
  label,
  imageSrc,
  selected,
  disabled,
  onSelect,
}: CoverTileProps) {
  const [failedUrl, setFailedUrl] = useState<string>();

  const imageFailed = imageSrc != undefined && failedUrl === imageSrc;

  return (
    <UnstyledButton
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "rounded-md border-2 p-1 transition-colors",
        selected ? "border-brand" : "border-transparent",
      )}
    >
      <AspectRatio
        ratio={264 / 354}
        pos="relative"
        className="overflow-hidden rounded-sm bg-paper-2"
      >
        {imageSrc == undefined ? (
          <Center h="100%">
            <IconPhoto size={"2rem"} className="text-dimmed" />
          </Center>
        ) : (
          <Image
            src={imageFailed ? GAME_COVER_PLACEHOLDER : imageSrc}
            alt={label}
            fit="cover"
            onError={() => setFailedUrl(imageSrc)}
          />
        )}
        {selected && (
          <Center
            aria-hidden
            pos="absolute"
            top={4}
            right={4}
            w={22}
            h={22}
            className="rounded-full bg-brand text-white"
          >
            <IconCheck size={"0.9rem"} />
          </Center>
        )}
      </AspectRatio>
      <Text size="xs" ta="center" lineClamp={2} mt={4}>
        {label}
      </Text>
    </UnstyledButton>
  );
}

const KIND_LABEL_KEYS = {
  [GameCoverOptionResponseDto.kind.LOCALIZED]:
    "game.coverPicker.kinds.localized",
  [GameCoverOptionResponseDto.kind.EDITION]: "game.coverPicker.kinds.edition",
  [GameCoverOptionResponseDto.kind.ALTERNATIVE]:
    "game.coverPicker.kinds.alternative",
  [GameCoverOptionResponseDto.kind.HISTORICAL]:
    "game.coverPicker.kinds.historical",
} as const;

/**
 * Lists the game's existing IGDB covers plus a default-cover choice (design
 * Decision 8). It only stores a choice or clears it: there is no upload or
 * cropping. Signed-out visitors can browse; choosing prompts them to sign in.
 */
const GameCoverPickerModal = ({
  game,
  opened,
  onClose,
}: GameCoverPickerModalProps) => {
  const { t } = useTranslation();
  const redirectToAuth = useRedirectToAuth();
  const { isPending: sessionPending } = authClient.useSession();
  const userId = useUserId();
  const [promptedToSignIn, setPromptedToSignIn] = useState(false);

  const optionsQuery = useGameCoverOptions(game.id, opened);
  const choiceQuery = useGameCoverChoice(game.id, opened);
  const viewerProfileQuery = useUserProfile(userId);

  const showSignInPrompt = () => setPromptedToSignIn(true);

  const setChoiceMutation = useSetGameCoverChoice(game.id, {
    onUnauthorized: showSignInPrompt,
  });
  const clearChoiceMutation = useClearGameCoverChoice(game.id, {
    onUnauthorized: showSignInPrompt,
  });

  const mode = normalizeGameCoverMode(viewerProfileQuery.data?.customCoverMode);
  const modeIsNone = !!viewerProfileQuery.data && mode === "none";

  // `undefined` while the choice is unknown: nothing is marked until it loads.
  const selectedOptionId = choiceQuery.data
    ? choiceQuery.data.coverOptionId
    : undefined;
  const mutationPending =
    setChoiceMutation.isPending || clearChoiceMutation.isPending;

  const options = optionsQuery.data ?? [];

  const selectChoice = (coverOptionId: number | null) => {
    if (sessionPending || mutationPending) {
      return;
    }
    if (!userId) {
      showSignInPrompt();
      return;
    }
    if (coverOptionId === selectedOptionId) {
      return;
    }

    if (coverOptionId === null) {
      clearChoiceMutation.mutate();
    } else {
      setChoiceMutation.mutate(coverOptionId);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("game.coverPicker.title")}
      centered
      size="lg"
    >
      <Stack gap="md">
        {promptedToSignIn && (
          <Alert
            color="yellow"
            variant="light"
            title={t("game.coverPicker.signInTitle")}
          >
            <Stack align="flex-start" gap="sm">
              <Text size="sm">{t("game.coverPicker.signInPrompt")}</Text>
              <Button
                size="xs"
                onClick={() => {
                  onClose();
                  void redirectToAuth();
                }}
              >
                {t("actions.login")}
              </Button>
            </Stack>
          </Alert>
        )}

        {modeIsNone && (
          <Alert color="blue" variant="light">
            {t("game.coverPicker.modeNoneNotice")}
          </Alert>
        )}

        {optionsQuery.isLoading ? (
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        ) : optionsQuery.isError ? (
          <Text size="sm" c="red">
            {t("game.coverPicker.error")}
          </Text>
        ) : options.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t("game.coverPicker.empty")}
          </Text>
        ) : (
          <SimpleGrid
            cols={{ base: 3, sm: 4 }}
            spacing="sm"
            verticalSpacing="sm"
          >
            <CoverTile
              label={t("game.coverPicker.default")}
              selected={!!userId && selectedOptionId === null}
              disabled={sessionPending || mutationPending}
              onSelect={() => selectChoice(null)}
            />
            {options.map((option) => {
              const label = option.label ?? t(KIND_LABEL_KEYS[option.kind]);

              return (
                <CoverTile
                  key={option.id}
                  label={label}
                  imageSrc={getOptionImageSrc(option.image)}
                  selected={!!userId && selectedOptionId === option.id}
                  disabled={sessionPending || mutationPending}
                  onSelect={() => selectChoice(option.id)}
                />
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Modal>
  );
};

export { GameCoverPickerModal };
