import {
  CenteredLoading,
  TextLink,
  useGames,
  usePlaytimeForUser,
  useUserId,
  useUserProfile,
} from "#@/components";
import { RecapCardPreview } from "#@/components/wrapped/card/RecapCardPreview";
import {
  RecapCoverGridCard,
  type RecapCoverGridEntry,
} from "#@/components/wrapped/card/RecapCoverGridCard";
import { RecapBentoCard } from "#@/components/wrapped/card/RecapBentoCard";
import { RecapDashCard } from "#@/components/wrapped/card/RecapDashCard";
import { RecapPosterCard } from "#@/components/wrapped/card/RecapPosterCard";
import {
  loadRecapFonts,
  RecapCardFonts,
} from "#@/components/wrapped/card/RecapCardFonts";
import { RecapSummaryCard } from "#@/components/wrapped/card/RecapSummaryCard";
import {
  DEFAULT_RECAP_CUSTOMIZATION,
  type RecapCustomization,
} from "#@/components/wrapped/card/recapCustomization";
import { RecapCustomizePanel } from "#@/components/wrapped/RecapCustomizePanel";
import {
  RecapFormatToggle,
  RecapTemplatePicker,
  type RecapTemplate,
} from "#@/components/wrapped/RecapTemplatePicker";
import {
  RECAP_CARD_FORMATS,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import {
  useRecapSummary,
  type RecapPeriod,
} from "#@/components/wrapped/hooks/useRecapSummary";
import { getRecapFigures } from "#@/components/wrapped/util/recapFigures";
import { useSupporterStatus } from "#@/components/supporter/hooks/useSupporterStatus";
import { useSupporterEntryHref } from "#@/components/supporter/util/useSupporterEntryHref";
import { RECAP_POSTER_HERO } from "#@/components/wrapped/card/recapPosterHero";
import { at, RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";
import {
  exportRecapVideo,
  isRecapVideoSupported,
  RECAP_VIDEO_MAX_SECONDS,
} from "#@/components/wrapped/util/exportRecapVideo";
import { createErrorNotification } from "#@/util";
import {
  ActionIcon,
  Button,
  Chip,
  ComboboxItem,
  FileButton,
  Flex,
  Group,
  MultiSelect,
  Progress,
  Select,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { FindAllPlaytimeFiltersDto } from "@repo/wrapper/server";
import { IconDownload, IconLock, IconVideo, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { toBlob, toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import period = FindAllPlaytimeFiltersDto.period;

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

type GridOption = (typeof GRID_OPTIONS)[number];

/** Story has the editorial templates; Feed keeps the wide summary. */
const TEMPLATES_BY_FORMAT: Record<RecapCardFormat, RecapTemplate[]> = {
  story: ["poster", "dash", "bento", "covers"],
  feed: ["summary", "covers"],
};

const PLAYTIME_PERIOD: Record<RecapPeriod, FindAllPlaytimeFiltersDto.period> = {
  week: period.WEEK,
  month: period.MONTH,
  year: period.YEAR,
};

interface Props {
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Failed to render the video overlay."));
    image.src = src;
  });
}

const WrappedRecapScreen = ({ onShare }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const userId = useUserId()!;
  const username = useUserProfile(userId).data?.username;

  const [recapPeriod, setRecapPeriod] = useState<RecapPeriod>("week");
  const [format, setFormat] = useState<RecapCardFormat>("story");
  const [template, setTemplate] = useState<RecapTemplate>("poster");
  const [grid, setGrid] = useState<GridOption>("3x3");
  const [excludedGameIds, setExcludedGameIds] = useState<number[]>([]);
  const [withRecentPlaytime, setWithRecentPlaytime] = useState(false);
  const [withTotalPlaytime, setWithTotalPlaytime] = useState(false);
  const [withSource, setWithSource] = useState(false);
  const [custom, setCustom] = useState<RecapCustomization>(
    DEFAULT_RECAP_CUSTOMIZATION,
  );

  // Video hero (supporters only, Poster in Story format)
  const supporterQuery = useSupporterStatus();
  const supporterHref = useSupporterEntryHref();
  const isSupporter = supporterQuery.data?.isSupporter ?? false;
  const videoSupported = isRecapVideoSupported();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    if (!videoFile) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const [cols, rows] = grid.split("x").map((value) => Number.parseInt(value));

  // Summary template data
  const summaryQuery = useRecapSummary(recapPeriod);
  const summaryGamesQuery = useGames(
    {
      gameIds: summaryQuery.data?.topGames.map((top) => top.gameId) ?? [],
      relations: { cover: true, artworks: true },
    },
    false,
    "off",
  );
  const figures = summaryQuery.data
    ? getRecapFigures(summaryQuery.data)
    : undefined;

  // Cover grid template data
  const playtimeQuery = usePlaytimeForUser({
    userId: userId,
    period: PLAYTIME_PERIOD[recapPeriod],
    orderBy: {
      lastPlayedDate: "DESC",
      recentPlaytimeSeconds: "DESC",
      totalPlaytimeSeconds: "DESC",
    },
    // Max cols * rows combination possible
    limit: 16,
  });
  const coverGamesQuery = useGames(
    {
      gameIds: Array.from(
        new Set(playtimeQuery.data?.data.map((playtime) => playtime.gameId)),
      ),
      relations: { cover: true },
    },
    false,
    "off",
  );

  const isSummary = template !== "covers";
  const isLoading = isSummary
    ? summaryQuery.isLoading || summaryGamesQuery.isLoading
    : playtimeQuery.isLoading || coverGamesQuery.isLoading;
  const isReady = isSummary
    ? summaryQuery.data != undefined && summaryGamesQuery.data != undefined
    : playtimeQuery.data != undefined && coverGamesQuery.data != undefined;
  const hasActivity = isSummary
    ? (figures?.hasActivity ?? false)
    : (playtimeQuery.data?.pagination.totalItems ?? 0) > 0;
  const isEmpty = isReady && !hasActivity;

  const periodText = t(`mobile.wrapped.card.period.${recapPeriod}`);

  // Games that can provide the backdrop art, in ranking order.
  const backdropGames = (summaryQuery.data?.topGames ?? []).flatMap((top) => {
    const game = summaryGamesQuery.data?.find((item) => item.id === top.gameId);
    return game ? [{ id: game.id, name: game.name }] : [];
  });

  const excludedGamesOptions = useMemo((): ComboboxItem[] => {
    if (coverGamesQuery.data == undefined) return [];
    return coverGamesQuery.data.map((game) => ({
      label: game.name,
      value: `${game.id}`,
    }));
  }, [coverGamesQuery.data]);

  const coverEntries = useMemo((): RecapCoverGridEntry[] => {
    if (coverGamesQuery.data == undefined || playtimeQuery.data == undefined)
      return [];

    return playtimeQuery.data.data
      .filter((playtime) => !excludedGameIds.includes(playtime.gameId))
      .flatMap((playtime) => {
        const game = coverGamesQuery.data.find(
          (item) => item.id === playtime.gameId,
        );
        if (!game) return [];

        return {
          id: playtime.id,
          game,
          recentPlaytimeSeconds: playtime.recentPlaytimeSeconds,
          totalPlaytimeSeconds: playtime.totalPlaytimeSeconds,
          platformAbbreviation: playtime.platform.abbreviation,
        };
      });
  }, [coverGamesQuery.data, excludedGameIds, playtimeQuery.data]);

  const shareMutation = useMutation({
    mutationFn: async (downloadOnly: boolean = false) => {
      const node = cardRef.current;
      if (!node) {
        throw new Error("Failed to generate final image.");
      }
      const size = RECAP_CARD_FORMATS[format];
      await loadRecapFonts();
      const blob = await toBlob(node, {
        // The card is rendered at its native size, so the export never
        // depends on the screen or on the preview scale.
        width: size.width,
        height: size.height,
        pixelRatio: 1,
        type: "image/jpeg",
        quality: 0.92,
        fetchRequestInit: {
          method: "GET",
          cache: "no-cache", // <-- Important!
        },
      });
      if (!blob) {
        throw new Error("Failed to generate final image.");
      }
      const filename = `gamenode-recap-${new Date().getTime()}.jpeg`;
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

  const videoMutation = useMutation({
    mutationFn: async (downloadOnly: boolean = false) => {
      const node = overlayRef.current;
      if (!node || !videoFile) {
        throw new Error("Failed to generate final video.");
      }
      setVideoProgress(0);
      const size = RECAP_CARD_FORMATS.story;
      await loadRecapFonts();
      const overlayUrl = await toPng(node, {
        width: size.width,
        height: size.height,
        pixelRatio: 1,
        fetchRequestInit: { method: "GET", cache: "no-cache" },
      });
      const file = await exportRecapVideo({
        file: videoFile,
        overlay: await loadImage(overlayUrl),
        onProgress: setVideoProgress,
      });

      if (downloadOnly) {
        return downloadFile(file);
      }

      await onShare(file);
    },
    onError: createErrorNotification,
  });

  const periodOptions = [
    { label: t("explore.periods.week"), value: "week" },
    { label: t("explore.periods.month"), value: "month" },
    { label: t("explore.periods.year"), value: "year" },
  ];

  const renderCard = (videoHero: boolean = false) => {
    if (isSummary) {
      if (!summaryQuery.data || !figures || !summaryGamesQuery.data) {
        return null;
      }

      const props = {
        format,
        userId,
        username,
        period: recapPeriod,
        periodText,
        summary: summaryQuery.data,
        figures,
        games: summaryGamesQuery.data,
        custom,
      };

      if (format === "feed" || template === "summary") {
        return <RecapSummaryCard {...props} />;
      }
      if (template === "dash") return <RecapDashCard {...props} />;
      if (template === "bento") return <RecapBentoCard {...props} />;
      return <RecapPosterCard {...props} videoHero={videoHero} />;
    }

    return (
      <RecapCoverGridCard
        format={format}
        userId={userId}
        periodText={periodText}
        cols={cols}
        rows={rows}
        entries={coverEntries}
        withRecentPlaytime={withRecentPlaytime}
        withTotalPlaytime={withTotalPlaytime}
        withSource={withSource}
      />
    );
  };

  const onFormatChange = (next: RecapCardFormat) => {
    setFormat(next);
    // Each format has its own templates; keep the choice when it still exists.
    if (!TEMPLATES_BY_FORMAT[next].includes(template)) {
      setTemplate(TEMPLATES_BY_FORMAT[next][0]!);
    }
  };

  const disabled = !isReady || isEmpty;
  const videoAvailable = template === "poster" && format === "story";
  const hasVideo = videoAvailable && isSupporter && !!videoFile && !!videoUrl;
  const captionProps = {
    size: "xs",
    fw: 700,
    tt: "uppercase",
    c: "dimmed",
    lts: 1,
  } as const;

  return (
    <div className={"flex flex-col w-full max-w-6xl mx-auto p-4 mb-20 gap-6"}>
      <RecapCardFonts />
      <Title order={2}>{t("mobile.wrapped.title")}</Title>

      {isEmpty && (
        <Text c={"red"}>
          {t("mobile.wrapped.messages.noPlaytime")}{" "}
          <TextLink href={"/preferences/connections"}>
            {t("mobile.importer.clickHere")}
          </TextLink>{" "}
        </Text>
      )}

      <div
        className={"grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] items-start"}
      >
        <div
          className={
            "rounded-2xl p-4 lg:sticky lg:top-4 min-h-48 flex flex-col justify-center border border-white/[0.06]"
          }
          style={{
            background:
              "radial-gradient(700px 500px at 50% 0%, rgba(241,80,37,0.16), transparent), #141311",
          }}
        >
          {isLoading && <CenteredLoading />}
          {isReady && !isEmpty && (
            <RecapCardPreview format={format} cardRef={cardRef}>
              {hasVideo ? (
                <div
                  className={"relative w-full h-full"}
                  style={{
                    background: `radial-gradient(900px 900px at 50% 90%, ${RECAP_COLORS.brand}38, transparent), ${RECAP_COLORS.ground}`,
                  }}
                >
                  <video
                    src={videoUrl!}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={"object-cover"}
                    style={{
                      ...at(
                        RECAP_POSTER_HERO.x,
                        RECAP_POSTER_HERO.y,
                        RECAP_POSTER_HERO.width,
                        RECAP_POSTER_HERO.height,
                      ),
                      borderRadius: RECAP_POSTER_HERO.radius,
                    }}
                  />
                  <div className={"absolute inset-0"}>{renderCard(true)}</div>
                </div>
              ) : (
                renderCard()
              )}
            </RecapCardPreview>
          )}
          {hasVideo && isReady && (
            // Off-screen copy with a transparent hero: the encoder draws the
            // background and the clip underneath this image.
            <div
              aria-hidden
              style={{
                position: "fixed",
                left: -99999,
                top: 0,
                pointerEvents: "none",
              }}
            >
              <div
                ref={overlayRef}
                style={{
                  width: RECAP_CARD_FORMATS.story.width,
                  height: RECAP_CARD_FORMATS.story.height,
                }}
              >
                {renderCard(true)}
              </div>
            </div>
          )}
        </div>

        <Stack gap={"lg"}>
          <Stack gap={6}>
            <Text {...captionProps}>{t("mobile.wrapped.labels.period")}</Text>
            <SegmentedControl
              fullWidth
              data={periodOptions}
              value={recapPeriod}
              onChange={(value) => setRecapPeriod(value as RecapPeriod)}
            />
          </Stack>

          <Stack gap={6}>
            <Text {...captionProps}>{t("mobile.wrapped.labels.format")}</Text>
            <RecapFormatToggle
              value={format}
              storyLabel={t("mobile.wrapped.formats.story")}
              feedLabel={t("mobile.wrapped.formats.feed")}
              onChange={onFormatChange}
            />
          </Stack>

          <Stack gap={6}>
            <Text {...captionProps}>{t("mobile.wrapped.labels.template")}</Text>
            <RecapTemplatePicker
              value={template}
              options={TEMPLATES_BY_FORMAT[format]}
              format={format}
              getLabel={(value) => t(`mobile.wrapped.templates.${value}`)}
              onChange={setTemplate}
            />
          </Stack>

          {isSummary && (
            <RecapCustomizePanel
              value={custom}
              onChange={setCustom}
              games={backdropGames}
              hasBackdrop={template === "poster" || template === "bento"}
              defaultOpacity={template === "bento" ? 0.18 : 0.32}
            />
          )}

          {!isSummary && (
            <>
              <Select
                label={t("mobile.wrapped.labels.gridStyle")}
                data={GRID_OPTIONS as unknown as string[]}
                value={grid}
                allowDeselect={false}
                onChange={(value) => value && setGrid(value as GridOption)}
              />
              <MultiSelect
                label={t("mobile.wrapped.labels.excludedGames")}
                description={t("mobile.wrapped.labels.excludedGamesHint")}
                data={excludedGamesOptions}
                value={excludedGameIds.map((id) => `${id}`)}
                onChange={(ids) =>
                  setExcludedGameIds(ids.map((id) => Number.parseInt(id)))
                }
                className={"min-w-60"}
              />
              <Flex className={"flex-wrap gap-3"}>
                <Chip
                  checked={withRecentPlaytime}
                  onChange={setWithRecentPlaytime}
                >
                  {t("mobile.wrapped.labels.withRecentPlaytime")}
                </Chip>
                <Chip
                  checked={withTotalPlaytime}
                  onChange={setWithTotalPlaytime}
                >
                  {t("mobile.wrapped.labels.withTotalPlaytime")}
                </Chip>
                <Chip checked={withSource} onChange={setWithSource}>
                  {t("mobile.wrapped.labels.withPlatform")}
                </Chip>
              </Flex>
            </>
          )}

          {videoAvailable && (
            <Stack gap={6}>
              <Text {...captionProps}>{t("mobile.wrapped.labels.video")}</Text>
              {!isSupporter ? (
                <Group gap={"xs"} wrap={"nowrap"} align={"flex-start"}>
                  <IconLock size={16} className={"shrink-0 mt-0.5"} />
                  <Text size={"sm"} c={"dimmed"}>
                    {t("mobile.wrapped.video.premiumOnly")}{" "}
                    <TextLink href={supporterHref}>
                      {t("mobile.wrapped.video.becomeSupporter")}
                    </TextLink>
                  </Text>
                </Group>
              ) : !videoSupported ? (
                <Text size={"sm"} c={"dimmed"}>
                  {t("mobile.wrapped.video.unsupported")}
                </Text>
              ) : (
                <>
                  <Text size={"sm"} c={"dimmed"}>
                    {t("mobile.wrapped.video.hint", {
                      seconds: RECAP_VIDEO_MAX_SECONDS,
                    })}
                  </Text>
                  <Group gap={"xs"} wrap={"nowrap"}>
                    <FileButton
                      onChange={setVideoFile}
                      accept={"video/mp4,video/quicktime,video/webm"}
                    >
                      {(props) => (
                        <Button
                          {...props}
                          variant={"default"}
                          leftSection={<IconVideo size={16} />}
                          className={"flex-grow min-w-0"}
                        >
                          <span className={"truncate"}>
                            {videoFile?.name ?? t("mobile.wrapped.video.pick")}
                          </span>
                        </Button>
                      )}
                    </FileButton>
                    {videoFile && (
                      <ActionIcon
                        size={"input-sm"}
                        variant={"default"}
                        onClick={() => setVideoFile(null)}
                        aria-label={t("mobile.wrapped.video.remove")}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                  {hasVideo && (
                    <Group className="w-full gap-xs" wrap={"nowrap"}>
                      <Button
                        onClick={() => videoMutation.mutate(false)}
                        loading={videoMutation.isPending}
                        disabled={disabled}
                        className={"flex-grow"}
                      >
                        {t("mobile.wrapped.video.generate")}
                      </Button>
                      <ActionIcon
                        size={"input-md"}
                        variant={"default"}
                        loading={videoMutation.isPending}
                        disabled={disabled}
                        onClick={() => videoMutation.mutate(true)}
                        aria-label={t("mobile.wrapped.buttons.download")}
                      >
                        <IconDownload />
                      </ActionIcon>
                    </Group>
                  )}
                  {videoMutation.isPending && (
                    <Progress value={videoProgress * 100} animated />
                  )}
                </>
              )}
            </Stack>
          )}

          <Group className="w-full gap-xs" wrap={"nowrap"}>
            <Button
              size={"md"}
              onClick={() => shareMutation.mutate(false)}
              loading={shareMutation.isPending}
              disabled={disabled}
              type={"button"}
              className={"flex-grow"}
            >
              {t("mobile.wrapped.buttons.generate")}
            </Button>
            <ActionIcon
              size={"input-md"}
              variant={"default"}
              loading={shareMutation.isPending}
              disabled={disabled}
              onClick={() => {
                shareMutation.mutate(true);
              }}
              aria-label={t("mobile.wrapped.buttons.download")}
            >
              <IconDownload></IconDownload>
            </ActionIcon>
          </Group>
        </Stack>
      </div>
    </div>
  );
};

export { WrappedRecapScreen };
