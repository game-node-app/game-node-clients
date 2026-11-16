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
  RECAP_BACKDROP_BLUR,
  RECAP_BACKDROP_OPACITY,
  RECAP_OVERLAY_DEFAULT_OPACITY,
  type RecapCustomization,
} from "#@/components/wrapped/card/recapCustomization";
import {
  RecapBackgroundControl,
  type RecapBackground,
} from "#@/components/wrapped/RecapBackgroundControl";
import { RecapCustomizePanel } from "#@/components/wrapped/RecapCustomizePanel";
import {
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
import {
  RECAP_MEDIA_RECTS,
  type RecapMediaTemplate,
} from "#@/components/wrapped/card/recapMedia";
import { at, RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";
import {
  exportRecapVideo,
  isRecapVideoSupported,
  RECAP_VIDEO_MAX_SECONDS,
} from "#@/components/wrapped/util/exportRecapVideo";
import { loadRecapPhoto } from "#@/components/wrapped/util/recapPhoto";
import { cn, createErrorNotification } from "#@/util";
import {
  ActionIcon,
  Button,
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
import { IconDownload } from "@tabler/icons-react";
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

  // What fills the top of the card: the game's art, a photo or a clip. The
  // picked files are kept when the user goes back to another choice, and the
  // overlay darkens a photo or clip for contrast.
  const [background, setBackground] = useState<RecapBackground>("art");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [overlay, setOverlay] = useState(RECAP_OVERLAY_DEFAULT_OPACITY);

  const videoUrlRef = useRef<string | null>(null);

  // The preview URL is created when a file is picked, not in an effect, so the
  // <video> source is ready on the same render as the file.
  const changeVideoFile = (file: File | null) => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
    }
    videoUrlRef.current = file ? URL.createObjectURL(file) : null;
    setVideoFile(file);
    setVideoUrl(videoUrlRef.current);
  };

  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
      }
    };
  }, []);

  const photoMutation = useMutation({
    mutationFn: (file: File) => loadRecapPhoto(file),
    onSuccess: (url) => setPhotoUrl(url),
    onError: () =>
      createErrorNotification(new Error(t("mobile.wrapped.photo.error"))),
  });

  const resetCustomization = () => {
    setCustom(DEFAULT_RECAP_CUSTOMIZATION);
    setBackground("art");
    setPhotoUrl(null);
    changeVideoFile(null);
    setOverlay(RECAP_OVERLAY_DEFAULT_OPACITY);
  };

  // Summary template data
  const summaryQuery = useRecapSummary(recapPeriod);
  const summaryGamesQuery = useGames(
    {
      gameIds: summaryQuery.data?.topGames.map((top) => top.gameId) ?? [],
      relations: { cover: true, artworks: true, screenshots: true },
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
    return game ? [game] : [];
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

  // The template the card is drawn with and the area its media fills.
  const activeTemplate: RecapMediaTemplate =
    format === "feed" ? "summary" : template;
  const mediaRect = RECAP_MEDIA_RECTS[activeTemplate];

  const videoMutation = useMutation({
    mutationFn: async (downloadOnly: boolean = false) => {
      const node = overlayRef.current;
      if (!node || !videoFile) {
        throw new Error("Failed to generate final video.");
      }
      setVideoProgress(0);
      const size = RECAP_CARD_FORMATS[format];
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
        format,
        hero: mediaRect,
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

  const renderTemplate = (
    target: RecapTemplate,
    videoHero: boolean = false,
  ) => {
    if (!summaryQuery.data || !figures || !summaryGamesQuery.data) {
      return null;
    }

    const props = {
      media: {
        photoSrc: background === "photo" ? photoUrl : null,
        video: videoHero,
        overlayOpacity: overlay,
      },
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

    if (format === "feed" || target === "summary") {
      return <RecapSummaryCard {...props} />;
    }
    if (target === "dash") return <RecapDashCard {...props} />;
    if (target === "bento") return <RecapBentoCard {...props} />;
    return <RecapPosterCard {...props} />;
  };

  const renderCard = (videoHero: boolean = false) =>
    renderTemplate(template, videoHero);

  const onFormatChange = (next: RecapCardFormat) => {
    setFormat(next);
    // Each format has its own templates; keep the choice when it still exists.
    if (!TEMPLATES_BY_FORMAT[next].includes(template)) {
      setTemplate(TEMPLATES_BY_FORMAT[next][0]!);
    }
  };

  const disabled = !isReady || isEmpty;
  // The clip is the active output only when the whole video path is available;
  // otherwise the screen keeps exporting the image shown in the preview.
  const hasVideo =
    background === "video" && videoSupported && !!videoFile && !!videoUrl;

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

  const cardSize = RECAP_CARD_FORMATS[format];
  const templateOptions = TEMPLATES_BY_FORMAT[format];

  return (
    <div className={"flex flex-col w-full max-w-6xl mx-auto p-4 mb-20 gap-6"}>
      <RecapCardFonts />
      <div className={"flex flex-wrap items-center justify-between gap-4"}>
        <Title order={2}>{t("mobile.wrapped.title")}</Title>
        <SegmentedControl
          aria-label={t("mobile.wrapped.labels.period")}
          className={"w-full sm:w-72"}
          data={periodOptions}
          value={recapPeriod}
          disabled={exportPending}
          onChange={(value) => setRecapPeriod(value as RecapPeriod)}
        />
      </div>

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
          "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_384px] items-start"
        }
      >
        <div
          className={
            "rounded-2xl p-6 min-h-48 flex flex-col gap-4 border border-white/[0.06] lg:sticky lg:top-sticky-safe"
          }
          style={{
            background:
              "radial-gradient(700px 500px at 50% 0%, rgba(241,80,37,0.2), transparent), #1A1A1A",
          }}
        >
          <div className={"flex items-center justify-between gap-4"}>
            <Text {...captionProps}>{t("mobile.wrapped.labels.preview")}</Text>
            <Text {...captionProps}>
              {cardSize.width} × {cardSize.height} · {hasVideo ? "MP4" : "JPG"}
            </Text>
          </div>

          <div className={"flex flex-1 flex-col justify-center"}>
            {isLoading && <CenteredLoading />}
            {isReady && !isEmpty && (
              <RecapCardPreview format={format} cardRef={cardRef}>
                {hasVideo ? (
                  <div
                    className={"relative w-full h-full"}
                    style={{ background: RECAP_COLORS.ground }}
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
                          mediaRect.x,
                          mediaRect.y,
                          mediaRect.width,
                          mediaRect.height,
                        ),
                        borderRadius: mediaRect.radius,
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
                    width: cardSize.width,
                    height: cardSize.height,
                  }}
                >
                  {renderCard(true)}
                </div>
              </div>
            )}
          </div>

          <div className={"flex justify-center"}>
            <fieldset
              disabled={exportPending}
              className={cn(
                "border-0 p-0 m-0 min-w-0 transition-opacity",
                exportPending && "opacity-50",
              )}
            >
              <SegmentedControl
                aria-label={t("mobile.wrapped.labels.format")}
                className={"w-56"}
                data={[
                  { label: t("mobile.wrapped.formats.story"), value: "story" },
                  { label: t("mobile.wrapped.formats.feed"), value: "feed" },
                ]}
                value={format}
                disabled={exportPending}
                onChange={(value) => onFormatChange(value as RecapCardFormat)}
              />
            </fieldset>
          </div>
        </div>

        <div
          className={
            "flex min-w-0 flex-col gap-6 rounded-2xl border border-white/[0.06] bg-[#1A1A1A] p-6"
          }
        >
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
            <Stack gap={"xl"}>
              {templateOptions.length > 1 && (
                <>
                  <Stack gap={12}>
                    <Text {...captionProps}>
                      {t("mobile.wrapped.labels.template")}
                    </Text>
                    <RecapTemplatePicker
                      value={template}
                      options={templateOptions}
                      format={format}
                      getLabel={(value) =>
                        t(`mobile.wrapped.templates.${value}`)
                      }
                      onChange={setTemplate}
                      renderPreview={(option) => renderTemplate(option)}
                    />
                  </Stack>
                  <div className={"h-px bg-white/[0.08]"} />
                </>
              )}

              <RecapBackgroundControl
                value={background}
                onChange={setBackground}
                onReset={resetCustomization}
                games={backdropGames}
                custom={custom}
                onCustomChange={setCustom}
                defaultOpacity={RECAP_BACKDROP_OPACITY[activeTemplate]}
                defaultBlur={RECAP_BACKDROP_BLUR[activeTemplate]}
                photoUrl={photoUrl}
                photoLoading={photoMutation.isPending}
                onPickPhoto={(file) => photoMutation.mutate(file)}
                onRemovePhoto={() => setPhotoUrl(null)}
                videoSupported={videoSupported}
                videoFile={videoFile}
                videoUrl={videoUrl}
                videoMaxSeconds={RECAP_VIDEO_MAX_SECONDS}
                onPickVideo={changeVideoFile}
                overlay={overlay}
                onOverlayChange={setOverlay}
              />

              <div className={"h-px bg-white/[0.08]"} />

              <RecapCustomizePanel value={custom} onChange={setCustom} />
            </Stack>
          </fieldset>

          <Stack
            gap={"xs"}
            className={
              "z-10 -mx-6 -mb-6 mt-auto rounded-b-2xl border-t border-white/[0.08] bg-[#1A1A1A] px-6 pb-6 pt-5 lg:sticky lg:bottom-0"
            }
          >
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
        </div>
      </div>
    </div>
  );
};

export { WrappedRecapScreen };
