import {
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
import { usePresenter } from "#@/context";
import { createErrorNotification, getCapitalizedText, Modal } from "#@/util";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Chip,
  ComboboxItem,
  Drawer,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { FindAllPlaytimeFiltersDto } from "@repo/wrapper/server";
import { IconDownload, IconInfoCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { toBlob } from "html-to-image";
import { useMemo, useRef, useState } from "react";
import { useElementSize, useMergedRef } from "@mantine/hooks";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";
import { z } from "zod";
import period = FindAllPlaytimeFiltersDto.period;

const CONTAINER_ID = "wrapped-share-preview-container";
const CARD_WIDTH = 480;
// .gn-wrapped-stage padding on both sides; useElementSize measures the border box
const STAGE_PADDING = 32;

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

const WeeklyWrappedFormSchema = z.object({
  period: z.enum([period.WEEK, period.MONTH, period.YEAR]),
  grid: z.enum(GRID_OPTIONS),
  withRecentPlaytime: z.boolean(),
  withTotalPlaytime: z.boolean(),
  withSource: z.boolean(),
  excludedGameIds: z.array(z.number()),
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
  const resultElementRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const userId = useUserId()!;

  const PERIOD_OPTIONS: ComboboxItem[] = [
    {
      label: t("explore.periods.week"),
      value: period.WEEK,
    },
    {
      label: t("explore.periods.month"),
      value: period.MONTH,
    },
    {
      label: t("explore.periods.year"),
      value: period.YEAR,
    },
  ];

  const onMobile = useOnMobile();

  const { watch, setValue } = useForm<WeeklyWrappedFormValues>({
    resolver: zodResolver(WeeklyWrappedFormSchema),
    mode: "onSubmit",
    defaultValues: {
      period: period.WEEK,
      grid: "3x3",
      excludedGameIds: [],
    },
  });

  const [gridStyle, setGridStyle] = useState({ cols: 3, rows: 3 });

  const selectedPeriod = watch("period");

  const excludedGameIds = watch("excludedGameIds");

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
    // Max cols * rows combination possible
    limit: 16,
  });

  const gameIds =
    playtimeQuery.data?.data.map((playtime) => playtime.gameId) ?? [];

  const gamesQuery = useGames({
    gameIds: Array.from(new Set(gameIds)),
    relations: {
      cover: true,
    },
  });

  const isLoading = playtimeQuery.isLoading || gamesQuery.isLoading;

  const shareMutation = useMutation({
    mutationFn: async (downloadOnly: boolean = false) => {
      const blob = await toBlob(resultElementRef.current!, {
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
      .with(period.WEEK, () => t("mobile.wrapped.weekly"))
      .with(period.MONTH, () => t("mobile.wrapped.monthly"))
      .with(period.YEAR, () => t("mobile.wrapped.yearly"))
      .exhaustive();
  }, [selectedPeriod, t]);

  const excludedGamesOptions = useMemo((): ComboboxItem[] => {
    if (gamesQuery.data == undefined) return [];
    return gamesQuery.data?.map((game) => ({
      label: game.name,
      value: `${game.id}`,
    }));
  }, [gamesQuery.data]);

  const renderedItems = useMemo(() => {
    if (gamesQuery.data == undefined || playtimeQuery.data == undefined)
      return null;

    // Num of rows * num of cols
    const renderedLimit = gridStyle.cols * gridStyle.rows;

    return playtimeQuery.data.data
      .filter((playtime) => !excludedGameIds.includes(playtime.gameId))
      .slice(0, renderedLimit)
      .map((playtime) => {
        const game = gamesQuery.data.find(
          (game) => game.id === playtime.gameId,
        )!;

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
                {withSource && (
                  <span>
                    {getCapitalizedText(playtime.platform.abbreviation)}
                  </span>
                )}
              </Text>
            </Box>
          </GameFigureImage>
        );
      });
  }, [
    excludedGameIds,
    gamesQuery.data,
    gridStyle,
    playtimeQuery.data,
    withRecentPlaytime,
    withSource,
    withTotalPlaytime,
  ]);

  const slotCount = gridStyle.cols * gridStyle.rows;
  const hasItems = (renderedItems?.length ?? 0) > 0;

  // the app's native modal (Modal presenter, the mobile ion-modal) keeps its sheet; otherwise a panel opens from the right
  const nativeModal = usePresenter("Modal") != undefined;

  // the preview is scaled down to fit the panel's free height; the exported card stays at CARD_WIDTH
  const stage = useElementSize();
  const card = useElementSize();
  const cardRef = useMergedRef(resultElementRef, card.ref);
  const maxCardHeight = nativeModal ? Infinity : stage.height - STAGE_PADDING;
  const scale =
    stage.width && card.height
      ? Math.min(
          1,
          (stage.width - STAGE_PADDING) / CARD_WIDTH,
          maxCardHeight / card.height,
        )
      : 1;

  const content = (
    <Box className={"gn-wrapped-layout flex-grow"}>
      <Stack className={"gap-xs min-w-0 flex-grow"}>
        <Text className={"text-sm font-semibold"}>
          {t("awards.labels.preview")}
        </Text>
        <Box ref={stage.ref} className={"gn-wrapped-stage"}>
          <Box
            style={{
              width: CARD_WIDTH * scale,
              height: card.height * scale || undefined,
            }}
          >
            {/* scaled here, not on the card: the card is what gets exported */}
            <Box
              style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}
            >
              <Stack
                className={"bg-paper gap-xs w-[480px] pointer-events-none"}
                id={CONTAINER_ID}
                ref={cardRef}
              >
                <SimpleGrid cols={gridStyle.cols} className={"gap-0 p-4"}>
                  {hasItems
                    ? renderedItems
                    : Array.from({ length: slotCount }, (_, i) =>
                        isLoading ? (
                          <Skeleton
                            key={i}
                            radius={0}
                            className={"gn-wrapped-slot"}
                          />
                        ) : (
                          <Box key={i} className={"gn-wrapped-slot"} />
                        ),
                      )}
                </SimpleGrid>

                <SimpleGrid
                  cols={3}
                  className={"items-center px-2 mb-2 mt-auto"}
                >
                  <UserAvatarGroup
                    userId={userId}
                    avatarProps={{
                      size: "md",
                    }}
                    groupProps={{
                      wrap: "nowrap",
                      gap: "xs",
                      className: "max-w-36",
                    }}
                    textProps={{
                      lineClamp: 1,
                      className: "text-sm text-start",
                    }}
                  />

                  <Text className={"text-sm text-center"}>{periodText}</Text>
                  <Box className={"flex justify-end w-full"}>
                    <GameNodeLogo className={"w-20"} />
                  </Box>
                </SimpleGrid>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Stack>

      <Stack className={"gap-md min-w-0"}>
        {playtimeQuery.data?.pagination.totalItems === 0 && (
          <Alert
            variant={"light"}
            color={"gray"}
            icon={<IconInfoCircle size={18} />}
          >
            {t("mobile.wrapped.messages.noPlaytime")}{" "}
            <TextLink href={"/preferences/connections"}>
              {t("mobile.importer.clickHere")}
            </TextLink>
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, xs: 2 }} className={"gap-sm"}>
          <Select
            label={t("mobile.wrapped.labels.period")}
            data={PERIOD_OPTIONS}
            value={selectedPeriod}
            allowDeselect={false}
            onChange={(v) => {
              setValue("period", v as never);
            }}
          />
          <Select
            label={t("mobile.wrapped.labels.gridStyle")}
            data={GRID_OPTIONS}
            value={watch("grid")}
            allowDeselect={false}
            onChange={(v) => onGridChange(v as never)}
          />
        </SimpleGrid>
        <MultiSelect
          label={t("mobile.wrapped.labels.excludedGames")}
          description={t("mobile.wrapped.labels.excludedGamesHint")}
          data={excludedGamesOptions}
          value={excludedGameIds.map((id) => `${id}`)}
          onChange={(ids) => {
            const convertedValue = ids.map((id) => Number.parseInt(id));
            setValue("excludedGameIds", convertedValue);
          }}
          disabled={excludedGamesOptions.length === 0}
        />
        <Group className={"gap-xs"}>
          <Chip
            checked={withRecentPlaytime}
            onChange={(v) => setValue("withRecentPlaytime", v)}
          >
            {t("mobile.wrapped.labels.withRecentPlaytime")}
          </Chip>
          <Chip
            checked={withTotalPlaytime}
            onChange={(v) => setValue("withTotalPlaytime", v)}
          >
            {t("mobile.wrapped.labels.withTotalPlaytime")}
          </Chip>
          <Chip
            checked={withSource}
            onChange={(v) => setValue("withSource", v)}
          >
            {t("mobile.wrapped.labels.withPlatform")}
          </Chip>
        </Group>

        <Group className="w-full gap-xs mt-auto pt-2 flex-nowrap">
          <Button
            onClick={() => shareMutation.mutate(false)}
            loading={shareMutation.isPending}
            disabled={!hasItems}
            type={"button"}
            size={"md"}
            className={"flex-grow"}
          >
            {t("mobile.wrapped.buttons.generate")}
          </Button>
          <ActionIcon
            loading={shareMutation.isPending}
            disabled={!hasItems}
            onClick={() => {
              shareMutation.mutate(true);
            }}
            size={42}
            variant={"default"}
            aria-label={t("mobile.wrapped.buttons.download")}
          >
            <IconDownload size={20} />
          </ActionIcon>
        </Group>
      </Stack>
    </Box>
  );

  if (nativeModal) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={t("mobile.wrapped.title")}
        classNames={{ body: "flex flex-col min-h-[92vh] lg:min-h-0" }}
      >
        {content}
      </Modal>
    );
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={"right"}
      size={onMobile ? "100%" : "lg"}
      title={t("mobile.wrapped.title")}
      classNames={{
        content:
          "gn-console-aside gn-console-aside-end gn-wrapped flex flex-col",
        body: "flex flex-col flex-grow",
      }}
    >
      {content}
    </Drawer>
  );
};

export { RecentlyPlayedGamesShare };
