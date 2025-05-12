import React, { useCallback, useState } from "react";
import {
  CenteredLoading,
  GameFigureImage,
  GameNodeLogo,
  TextLink,
  useGames,
  useOnMobile,
  usePlaytimeForUser,
  UserAvatarGroup,
  useUserId,
} from "#@/components";
import { FindAllPlaytimeFiltersDto } from "@repo/wrapper/server";
import period = FindAllPlaytimeFiltersDto.period;
import {
  ActionIcon,
  Box,
  Button,
  Chip,
  ComboboxItem,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  createErrorNotification,
  EMatomoEventAction,
  EMatomoEventCategory,
  Link,
  Modal,
  trackMatomoEvent,
} from "#@/util";
import { z } from "zod";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toBlob } from "html-to-image";
import { IconDownload } from "@tabler/icons-react";

const CONTAINER_ID = "wrapped-share-preview-container";

const GRID_OPTIONS = [
  "2x3",
  "2x2",
  "3x4",
  "3x3",
  "3x2",
  "4x3",
  "4x2",
  "4x4",
] as const;

const PERIOD_OPTIONS: ComboboxItem[] = [
  {
    label: "Week",
    value: period.WEEK,
  },
  {
    label: "Month",
    value: period.MONTH,
  },
  {
    label: "Year",
    value: period.YEAR,
  },
];

const WeeklyWrappedFormSchema = z.object({
  period: z.enum([period.WEEK, period.MONTH, period.YEAR]),
  grid: z.enum(GRID_OPTIONS),
});

type WeeklyWrappedFormValues = z.infer<typeof WeeklyWrappedFormSchema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  /**
   * The function called when the user clicks the SHARE button.
   * Should throw errors if share is not possible.
   * @param file
   */
  onShare: (file: File) => Promise<void>;
}

function downloadFile(file: File) {
  const objectURL = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.download = file.name;
  link.href = objectURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectURL);
}

const RecentlyPlayedGamesShare = ({ opened, onClose, onShare }: Props) => {
  const userId = useUserId()!;

  const onMobile = useOnMobile();

  const { register, watch, setValue } = useForm<WeeklyWrappedFormValues>({
    resolver: zodResolver(WeeklyWrappedFormSchema),
    mode: "onSubmit",
    defaultValues: {
      period: period.WEEK,
      grid: "3x3",
    },
  });

  const [gridStyle, setGridStyle] = useState({ cols: 3, rows: 3 });

  // Num of rows * num of cols
  const limit = gridStyle.cols * gridStyle.rows;

  const selectedPeriod = watch("period");

  const playtimeQuery = usePlaytimeForUser({
    userId: userId,
    period: selectedPeriod,
    orderBy: {
      lastPlayedDate: "DESC",
      recentPlaytimeSeconds: "DESC",
      totalPlaytimeSeconds: "DESC",
    },
    limit: limit,
  });

  const gameIds = playtimeQuery.data?.data.map((playtime) => playtime.gameId);

  const gamesQuery = useGames({
    gameIds: gameIds,
    relations: {
      cover: true,
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (downloadOnly: boolean = false) => {
      const node = document.getElementById(CONTAINER_ID);
      const blob = await toBlob(node!, {
        fetchRequestInit: {
          method: "GET",
          cache: "no-cache", // <-- Important!
        },
      });
      if (!blob) {
        throw new Error("Failed to generate final image.");
      }
      // The blob always has 'image/jpeg' as mimetype.
      const extension = "jpeg";
      const filename = `gamenode-wrapped-${new Date().getTime()}.${extension}`;
      const file = new File([blob], filename, {
        type: blob.type,
      });

      if (downloadOnly) {
        return downloadFile(file);
      }

      await onShare(file);
    },
    onSuccess: () => {
      trackMatomoEvent(
        EMatomoEventCategory.Review,
        EMatomoEventAction.Share,
        "Shared generated review image with the game info share button",
      );
    },
    onError: createErrorNotification,
  });

  const onGridChange = (v: WeeklyWrappedFormValues["grid"]) => {
    setValue("grid", v);
    const params = v.split("x");
    setGridStyle({
      cols: Number.parseInt(params[0]),
      rows: Number.parseInt(params[1]),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Weekly Wrapped"}
      size={"lg"}
      fullScreen={onMobile}
    >
      {playtimeQuery.data?.pagination.totalItems === 0 && (
        <Text c={"red"}>
          We&apos;ve found no playtime info for the selected period. You may
          change the period criteria below or{" "}
          <TextLink href={""}>set up a connection</TextLink> to start importing
          playtime info.
        </Text>
      )}
      <Text>Preview</Text>

      {gamesQuery.data != undefined && gamesQuery.data.length < limit && (
        <Text className={"text-sm text-yellow-400"}>
          You don&apos;t have enough playtime data in the selected period to
          fill the entire grid.
        </Text>
      )}
      {(playtimeQuery.isLoading || gamesQuery.isLoading) && <CenteredLoading />}
      <Box className={"overflow-auto"}>
        <Stack className={"bg-[#191919] gap-xs w-[480px]"} id={CONTAINER_ID}>
          <SimpleGrid cols={gridStyle.cols} className={"gap-0 p-4"}>
            {gamesQuery.data?.map((game) => {
              return (
                <GameFigureImage
                  key={game.id}
                  game={game}
                  imageProps={{
                    radius: undefined,
                  }}
                />
              );
            })}
          </SimpleGrid>

          <Box
            className={
              "grid grid-cols-[1fr_auto_1fr] items-center px-2 mb-2 mt-auto"
            }
          >
            <Box className={"w-fit"}>
              <UserAvatarGroup
                userId={userId}
                avatarProps={{
                  size: "md",
                }}
                textProps={{
                  size: "md",
                }}
              />
            </Box>

            <Text className={"text-sm"}>Wrapped</Text>
            <GameNodeLogo className={"w-20 ms-auto"} />
          </Box>
        </Stack>
      </Box>

      <Stack>
        <Group className={"my-3"}>
          <Select
            label={"Period"}
            data={PERIOD_OPTIONS}
            value={selectedPeriod}
            allowDeselect={false}
            onChange={(v) => {
              setValue("period", v as never);
            }}
          />
          <Select
            label={"Grid style"}
            data={GRID_OPTIONS}
            value={watch("grid")}
            onChange={(v) => onGridChange(v as never)}
          />
        </Group>
        <Group className="w-full gap-xs">
          <Button
            onClick={() => shareMutation.mutate(false)}
            loading={shareMutation.isPending}
            type={"button"}
            className={"flex-grow"}
          >
            Generate
          </Button>
          <ActionIcon
            loading={shareMutation.isPending}
            onClick={() => {
              shareMutation.mutate(true);
            }}
            size={"lg"}
          >
            <IconDownload></IconDownload>
          </ActionIcon>
        </Group>
      </Stack>
    </Modal>
  );
};

export { RecentlyPlayedGamesShare };
