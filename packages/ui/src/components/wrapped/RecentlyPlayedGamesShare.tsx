import React, { useMemo, useState } from "react";
import {
  CenteredLoading,
  DetailsBox,
  GameFigureImage,
  GameNodeLogo,
  ImageSize,
  TextLink,
  useGames,
  useOnMobile,
  usePlaytimeForUser,
  UserAvatarGroup,
  useUserId,
} from "#@/components";
import { FindAllPlaytimeFiltersDto } from "@repo/wrapper/server";
import {
  ActionIcon,
  Box,
  Button,
  Chip,
  ComboboxItem,
  Flex,
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
  getCapitalizedText,
  Modal,
  trackMatomoEvent,
} from "#@/util";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toBlob } from "html-to-image";
import { IconDownload } from "@tabler/icons-react";
import period = FindAllPlaytimeFiltersDto.period;
import { match } from "ts-pattern";

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
  withRecentPlaytime: z.boolean(),
  withTotalPlaytime: z.boolean(),
  withSource: z.boolean(),
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

  const { watch, setValue } = useForm<WeeklyWrappedFormValues>({
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

  const withRecentPlaytime = watch("withRecentPlaytime");
  const withTotalPlaytime = watch("withTotalPlaytime");
  const withSource = watch("withSource");

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

  const gameIds =
    playtimeQuery.data?.data.map((playtime) => playtime.gameId) ?? [];

  const gamesQuery = useGames({
    gameIds: Array.from(new Set(gameIds)),
    relations: {
      cover: true,
    },
  });

  console.log("Games in query: ", gamesQuery.data);

  const isLoading = playtimeQuery.isLoading || gamesQuery.isLoading;

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

  const periodText = useMemo(() => {
    return match(selectedPeriod)
      .with(period.WEEK, () => "Weekly Wrapped")
      .with(period.MONTH, () => "Monthly Wrapped")
      .with(period.YEAR, () => "Yearly Wrapped")
      .exhaustive();
  }, [selectedPeriod]);

  const figures = useMemo(() => {
    if (gamesQuery.data == undefined || playtimeQuery.data == undefined)
      return null;

    return playtimeQuery.data.data.map((playtime) => {
      const game = gamesQuery.data.find((game) => game.id === playtime.gameId)!;

      return (
        <GameFigureImage
          key={playtime.id}
          game={game}
          imageProps={{
            radius: undefined,
          }}
          linkProps={{
            className: "pointer-events-none",
            onClick: (evt) => evt.preventDefault(),
          }}
          imageSize={ImageSize.COVER_BIG_2X}
        >
          <Box className={"absolute top-1 left-1"}>
            <Text
              className={"font-bold text-xs leading-tight"}
              style={{
                textShadow: "1px 1px 2px black",
              }}
            >
              {withRecentPlaytime && (
                <span>
                  Recent: {Math.ceil(playtime.recentPlaytimeSeconds / 3600)}
                  h
                  <br />
                </span>
              )}
              {withTotalPlaytime && (
                <span>
                  Total: {Math.ceil(playtime.totalPlaytimeSeconds / 3600)}
                  h
                  <br />
                </span>
              )}
              {withSource && <span>{getCapitalizedText(playtime.source)}</span>}
            </Text>
          </Box>
        </GameFigureImage>
      );
    });
  }, [
    gamesQuery.data,
    playtimeQuery.data,
    withRecentPlaytime,
    withSource,
    withTotalPlaytime,
  ]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={"Your Wrapped"}
      size={"lg"}
      fullScreen={onMobile}
      classNames={{
        body: "flex flex-col min-h-[92vh] lg:min-h-[30vh]",
      }}
    >
      <Stack className={"flex-grow mb-4"}>
        {playtimeQuery.data?.pagination.totalItems === 0 && (
          <Text c={"red"}>
            We&apos;ve found no playtime info for the selected period. You may
            change the period criteria below or{" "}
            <TextLink href={""}>set up a connection</TextLink> to start
            importing playtime info.
          </Text>
        )}

        {gamesQuery.data != undefined && gamesQuery.data.length < limit && (
          <Text className={"text-sm text-yellow-400"}>
            You don&apos;t have enough playtime data in the selected period to
            fill the entire grid.
          </Text>
        )}
        {isLoading && <CenteredLoading />}
        <DetailsBox
          enabled={!isLoading && gamesQuery.data != undefined}
          title={"Preview"}
        >
          <Box className={"overflow-auto"}>
            <Stack
              className={"bg-[#191919] gap-xs w-[480px] pointer-events-none"}
              id={CONTAINER_ID}
            >
              <SimpleGrid cols={gridStyle.cols} className={"gap-0 p-4"}>
                {figures}
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

                <Text className={"text-sm"}>{periodText}</Text>
                <GameNodeLogo className={"w-20 ms-auto"} />
              </Box>
            </Stack>
          </Box>
        </DetailsBox>

        <Stack className={"h-full"}>
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
          <Flex className={"flex-col lg:flex-row gap-4"}>
            <Chip
              checked={withRecentPlaytime}
              onChange={(v) => setValue("withRecentPlaytime", v)}
            >
              With recent playtime
            </Chip>
            <Chip
              checked={withTotalPlaytime}
              onChange={(v) => setValue("withTotalPlaytime", v)}
            >
              With total playtime
            </Chip>
            <Chip
              checked={withSource}
              onChange={(v) => setValue("withSource", v)}
            >
              With platform
            </Chip>
          </Flex>
        </Stack>
      </Stack>

      <Group className="w-full gap-xs mt-auto lg:mt-6">
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
    </Modal>
  );
};

export { RecentlyPlayedGamesShare };
