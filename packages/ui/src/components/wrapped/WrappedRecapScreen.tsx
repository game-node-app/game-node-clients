import {
  CenteredLoading,
  TextLink,
  useGames,
  useUserId,
  useUserProfile,
} from "#@/components";
import { RecapCardPreview } from "#@/components/wrapped/card/RecapCardPreview";
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
import { RECAP_POSTER_HERO } from "#@/components/wrapped/card/recapPosterHero";
import { at, RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";
import {
  exportRecapVideo,
  isRecapVideoSupported,
  RECAP_VIDEO_MAX_SECONDS,
} from "#@/components/wrapped/util/exportRecapVideo";
import { cn, createErrorNotification } from "#@/util";
import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  Loader,
  Progress,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconDownload, IconVideo, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { toBlob, toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";

/** Story has the editorial templates; Feed keeps the wide summary. */
const TEMPLATES_BY_FORMAT: Record<RecapCardFormat, RecapTemplate[]> = {
  story: ["poster", "dash", "bento"],
  feed: ["summary"],
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
  const [custom, setCustom] = useState<RecapCustomization>(
    DEFAULT_RECAP_CUSTOMIZATION,
  );

  // Video hero (Poster in Story format)
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

  const isLoading = summaryQuery.isLoading || summaryGamesQuery.isLoading;
  const isReady =
    summaryQuery.data != undefined && summaryGamesQuery.data != undefined;
  const hasActivity = figures?.hasActivity ?? false;
  const isEmpty = isReady && !hasActivity;

  const periodText = t(`mobile.wrapped.card.period.${recapPeriod}`);

  // Games that can provide the backdrop art, in ranking order.
  const backdropGames = (summaryQuery.data?.topGames ?? []).flatMap((top) => {
    const game = summaryGamesQuery.data?.find((item) => item.id === top.gameId);
    return game ? [{ id: game.id, name: game.name }] : [];
  });

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
  // The clip is the active output only when the whole video path is available;
  // otherwise the screen keeps exporting the image shown in the preview.
  const hasVideo =
    videoAvailable && videoSupported && !!videoFile && !!videoUrl;

  // One export area for whichever output is active: the clip or the card.
  const exportPending = shareMutation.isPending || videoMutation.isPending;
  const exportDisabled = disabled || exportPending;
  const videoPercent = Math.round(videoProgress * 100);
  const shareLabel = hasVideo
    ? t("mobile.wrapped.buttons.shareVideo")
    : t("mobile.wrapped.buttons.shareImage");
  const downloadLabel = hasVideo
    ? t("mobile.wrapped.buttons.downloadVideo")
    : t("mobile.wrapped.buttons.downloadImage");
  const preparingLabel = videoMutation.isPending
    ? t("mobile.wrapped.buttons.preparingVideo", { progress: videoPercent })
    : t("mobile.wrapped.buttons.preparingImage");

  const shareActive = () => {
    if (hasVideo) {
      videoMutation.mutate(false);
      return;
    }
    shareMutation.mutate(false);
  };

  const downloadActive = () => {
    if (hasVideo) {
      videoMutation.mutate(true);
      return;
    }
    shareMutation.mutate(true);
  };

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
        className={
          "grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] items-start"
        }
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

        <Stack gap={"lg"} className={"min-w-0"}>
          {/* An export reads the preview as it is now, so every control that
              changes the preview or the output is locked while it runs. */}
          <fieldset
            disabled={exportPending}
            inert={exportPending || undefined}
            className={cn(
              "border-0 p-0 m-0 min-w-0 transition-opacity",
              exportPending && "opacity-50",
            )}
          >
            <Stack gap={"lg"}>
              <Stack gap={6}>
                <Text {...captionProps}>
                  {t("mobile.wrapped.labels.period")}
                </Text>
                <SegmentedControl
                  fullWidth
                  data={periodOptions}
                  value={recapPeriod}
                  disabled={exportPending}
                  onChange={(value) => setRecapPeriod(value as RecapPeriod)}
                />
              </Stack>

              <Stack gap={6}>
                <Text {...captionProps}>
                  {t("mobile.wrapped.labels.format")}
                </Text>
                <RecapFormatToggle
                  value={format}
                  storyLabel={t("mobile.wrapped.formats.story")}
                  feedLabel={t("mobile.wrapped.formats.feed")}
                  onChange={onFormatChange}
                />
              </Stack>

              <Stack gap={6}>
                <Text {...captionProps}>
                  {t("mobile.wrapped.labels.template")}
                </Text>
                <RecapTemplatePicker
                  value={template}
                  options={TEMPLATES_BY_FORMAT[format]}
                  format={format}
                  getLabel={(value) => t(`mobile.wrapped.templates.${value}`)}
                  onChange={setTemplate}
                />
              </Stack>

              <RecapCustomizePanel
                value={custom}
                onChange={setCustom}
                games={backdropGames}
                hasBackdrop={template === "poster" || template === "bento"}
                defaultOpacity={template === "bento" ? 0.18 : 0.32}
              />

              {videoAvailable && (
                <Stack gap={6}>
                  <Text {...captionProps}>
                    {t("mobile.wrapped.labels.video")}
                  </Text>
                  {!videoSupported ? (
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
                          disabled={exportPending}
                        >
                          {(props) => (
                            <Button
                              {...props}
                              variant={"default"}
                              leftSection={<IconVideo size={16} />}
                              disabled={exportPending}
                              className={"flex-grow min-w-0"}
                            >
                              <span className={"truncate"}>
                                {videoFile?.name ??
                                  t("mobile.wrapped.video.pick")}
                              </span>
                            </Button>
                          )}
                        </FileButton>
                        {videoFile && (
                          <ActionIcon
                            size={"input-sm"}
                            variant={"default"}
                            disabled={exportPending}
                            onClick={() => setVideoFile(null)}
                            aria-label={t("mobile.wrapped.video.remove")}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </>
                  )}
                </Stack>
              )}
            </Stack>
          </fieldset>

          <Stack gap={"xs"}>
            {videoMutation.isPending && (
              <Progress
                value={videoPercent}
                animated
                aria-label={preparingLabel}
              />
            )}
            <Group className="w-full gap-xs" wrap={"nowrap"}>
              <Button
                size={"md"}
                type={"button"}
                onClick={shareActive}
                disabled={exportDisabled}
                aria-busy={exportPending || undefined}
                leftSection={exportPending ? <Loader size={16} /> : undefined}
                className={"flex-grow"}
              >
                {shareLabel}
              </Button>
              <Tooltip label={downloadLabel}>
                <ActionIcon
                  size={"input-md"}
                  variant={"default"}
                  disabled={exportDisabled}
                  onClick={downloadActive}
                  aria-label={downloadLabel}
                >
                  <IconDownload />
                </ActionIcon>
              </Tooltip>
            </Group>
            {exportPending && (
              <Text
                size={"xs"}
                c={"dimmed"}
                role={"status"}
                aria-live={"polite"}
              >
                {preparingLabel}
              </Text>
            )}
          </Stack>
        </Stack>
      </div>
    </div>
  );
};

export { WrappedRecapScreen };
