import {
  CenteredLoading,
  TextLink,
  useGames,
  useUserId,
  useUserProfile,
} from "#@/components";
import { RecapStoreSync } from "#@/components/recap/RecapStoreSync";
import { RecapCardPreview } from "#@/components/wrapped/card/RecapCardPreview";
import { RecapAuraCard } from "#@/components/wrapped/card/RecapAuraCard";
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
import {
  at,
  formatPlaytime,
  RECAP_COLORS,
} from "#@/components/wrapped/card/recapCardTheme";
import { exportCardImage } from "#@/components/wrapped/util/exportCardImage";
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
  Transition,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import {
  IconAdjustmentsHorizontal,
  IconDeviceMobile,
  IconDownload,
  IconInfoCircle,
  IconPhoto,
  IconUpload,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Story has the editorial templates; Feed keeps the wide summary. */
const TEMPLATES_BY_FORMAT: Record<RecapCardFormat, RecapTemplate[]> = {
  story: ["poster", "dash", "bento", "aura"],
  feed: ["summary"],
};

interface Props {
  /**
   * The function called when the user clicks the SHARE button.
   * Should throw errors if share is not possible.
   * @param file
   */
  onShare: (file: File) => Promise<void>;
  /**
   * The period the screen opens on, e.g. when coming from a home screen widget that
   * summarises the year.
   * @default "week"
   */
  initialPeriod?: RecapPeriod;
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

const WrappedRecapScreen = ({ onShare, initialPeriod = "week" }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const userId = useUserId()!;
  const username = useUserProfile(userId).data?.username;

  // Phones get a one-screen layout: the card is the hero and the controls live
  // in a bottom sheet. Wide screens keep the two-column editor.
  const isWide = useMediaQuery("(min-width: 64em)", false);
  const compact = !isWide;
  const { height: viewportHeight } = useViewportSize();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"format" | "backdrop" | "style">(
    "backdrop",
  );
  const swipeStartX = useRef<number | null>(null);

  const [recapPeriod, setRecapPeriod] = useState<RecapPeriod>(initialPeriod);
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

  // While the customize panel is open the floating tab bar slides out of the way
  // (apps style `body.gn-hide-tabbar`), freeing its space for the controls.
  useEffect(() => {
    if (!compact) return;
    document.body.classList.toggle("gn-hide-tabbar", sheetOpen);
    return () => document.body.classList.remove("gn-hide-tabbar");
  }, [compact, sheetOpen]);

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
  const current = summaryQuery.data?.current;
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
      const file = await exportCardImage(node, format);

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
    if (target === "aura") return <RecapAuraCard {...props} />;
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

  const openSheet = (tab: "format" | "backdrop" | "style") => {
    setSheetTab(tab);
    setSheetOpen(true);
  };

  const previewContent: ReactNode = (
    <>
      {isLoading && <CenteredLoading />}
      {isReady && !isEmpty && (
        <RecapCardPreview
          format={format}
          cardRef={cardRef}
          maxHeight={
            compact
              ? sheetOpen
                ? Math.max(140, viewportHeight * 0.26)
                : Math.max(240, viewportHeight - 440)
              : undefined
          }
        >
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
            style={{ width: cardSize.width, height: cardSize.height }}
          >
            {renderCard(true)}
          </div>
        </div>
      )}
    </>
  );

  const templatePicker = templateOptions.length > 1 && (
    <>
      <Stack gap={12}>
        <Text {...captionProps}>{t("mobile.wrapped.labels.template")}</Text>
        <RecapTemplatePicker
          value={template}
          options={templateOptions}
          format={format}
          getLabel={(value) => t(`mobile.wrapped.templates.${value}`)}
          onChange={setTemplate}
          renderPreview={(option) => renderTemplate(option)}
        />
      </Stack>
      <div className={"h-px bg-white/[0.08]"} />
    </>
  );

  const backgroundControl = (
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
  );

  const formatControl = (
    <SegmentedControl
      aria-label={t("mobile.wrapped.labels.format")}
      fullWidth
      data={[
        { label: t("mobile.wrapped.formats.story"), value: "story" },
        { label: t("mobile.wrapped.formats.feed"), value: "feed" },
      ]}
      value={format}
      disabled={exportPending}
      onChange={(value) => onFormatChange(value as RecapCardFormat)}
    />
  );

  const exportProgress = videoMutation.isPending && (
    <Progress value={videoPercent} animated aria-label={preparingLabel} />
  );

  const exportStatus = exportPending && (
    <Text size={"xs"} c={"dimmed"} role={"status"} aria-live={"polite"}>
      {preparingLabel}
    </Text>
  );

  const periodControl = (className: string) => (
    <div className={cn("flex flex-col gap-1", className)}>
      <SegmentedControl
        aria-label={t("mobile.wrapped.labels.period")}
        data={periodOptions}
        value={recapPeriod}
        disabled={exportPending}
        onChange={(value) => setRecapPeriod(value as RecapPeriod)}
      />
      {current && current.estimatedPlaytimeSeconds > 0 && (
        <Group gap={"xs"}>
          <Text size={"sm"} c={"dimmed"}>
            {t("mobile.wrapped.card.hoursPlayed")}{" "}
            <strong>~{formatPlaytime(current.totalPlaytimeSeconds)}</strong>
          </Text>
          <Tooltip
            label={t("recap.playtime.estimateExplanation")}
            events={{ hover: true, focus: true, touch: true }}
            multiline
            w={280}
            withArrow
          >
            <ActionIcon
              aria-label={t("recap.playtime.estimateDetails")}
              size={"sm"}
              variant={"subtle"}
              color={"gray"}
            >
              <IconInfoCircle size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </div>
  );

  const emptyMessage = isEmpty && (
    <Text c={"red"}>
      {t("mobile.wrapped.messages.noPlaytime")}{" "}
      <TextLink href={"/preferences/connections"}>
        {t("mobile.importer.clickHere")}
      </TextLink>{" "}
    </Text>
  );

  if (compact) {
    const templateIndex = Math.max(templateOptions.indexOf(template), 0);
    const goToTemplate = (next: number) => {
      const target = templateOptions[next];
      if (target) setTemplate(target);
    };
    const chips = [
      {
        tab: "format" as const,
        label: t(`mobile.wrapped.formats.${format}`),
        Icon: IconDeviceMobile,
      },
      {
        tab: "backdrop" as const,
        label: t("mobile.wrapped.labels.backdrop"),
        Icon: IconPhoto,
      },
      {
        tab: "style" as const,
        label: t("mobile.wrapped.labels.style"),
        Icon: IconAdjustmentsHorizontal,
      },
    ];

    return (
      <div className={"flex flex-col w-full gap-3"}>
        <RecapCardFonts />
        {!sheetOpen && <Title order={2}>{t("mobile.wrapped.title")}</Title>}
        {periodControl("w-full")}
        {emptyMessage}

        <div
          className={"flex flex-1 flex-col justify-center touch-pan-y min-h-40"}
          onTouchStart={(event) => {
            swipeStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = swipeStartX.current;
            swipeStartX.current = null;
            const end = event.changedTouches[0]?.clientX;
            if (start == null || end == null || exportPending) return;
            const delta = end - start;
            if (Math.abs(delta) < 40) return;
            goToTemplate(templateIndex + (delta < 0 ? 1 : -1));
          }}
        >
          {previewContent}
        </div>

        {templateOptions.length > 1 && !sheetOpen && (
          <Group justify={"center"} gap={"xs"}>
            <Text size={"xs"} fw={500} c={"dimmed"}>
              {t(`mobile.wrapped.templates.${template}`)}
            </Text>
            {templateOptions.map((option, index) => (
              <button
                key={option}
                type={"button"}
                aria-label={t(`mobile.wrapped.templates.${option}`)}
                aria-current={index === templateIndex}
                disabled={exportPending}
                onClick={() => goToTemplate(index)}
                className={cn(
                  "h-1.5 rounded-full border-0 p-0 transition-all",
                  index === templateIndex
                    ? "w-4 bg-brand"
                    : "w-1.5 bg-white/25",
                )}
              />
            ))}
          </Group>
        )}

        {!sheetOpen && (
          <>
            <div className={"grid grid-cols-3 gap-2"}>
              {chips.map(({ tab, label, Icon }) => (
                <Button
                  key={tab}
                  variant={"default"}
                  size={"sm"}
                  px={"xs"}
                  disabled={disabled || exportPending}
                  leftSection={<Icon size={16} />}
                  onClick={() => openSheet(tab)}
                  classNames={{ inner: "justify-center" }}
                >
                  {label}
                </Button>
              ))}
            </div>

            <Stack gap={"xs"}>
              {exportProgress}
              <Group className="w-full gap-xs" wrap={"nowrap"}>
                <Button
                  size={"lg"}
                  type={"button"}
                  onClick={shareActive}
                  disabled={exportDisabled}
                  aria-busy={exportPending || undefined}
                  leftSection={
                    exportPending ? (
                      <Loader size={16} />
                    ) : (
                      <IconUpload size={20} />
                    )
                  }
                  className={"flex-grow"}
                >
                  {shareLabel}
                </Button>
                <ActionIcon
                  size={"input-lg"}
                  variant={"default"}
                  disabled={exportDisabled}
                  onClick={downloadActive}
                  aria-label={downloadLabel}
                >
                  <IconDownload />
                </ActionIcon>
              </Group>
              {exportStatus}
            </Stack>
            {userId && <RecapStoreSync />}
          </>
        )}

        <Transition
          mounted={sheetOpen}
          transition={"slide-up"}
          duration={280}
          timingFunction={"cubic-bezier(0.22, 1, 0.36, 1)"}
        >
          {(transitionStyles) => (
            <div
              style={transitionStyles}
              className={
                "flex flex-col gap-3 rounded-t-2xl border border-b-0 border-white/[0.08] bg-[#1A1A1A] p-3"
              }
            >
              <Group justify={"space-between"}>
                <Text fw={700}>{t("mobile.wrapped.labels.customize")}</Text>
                <Button size={"compact-sm"} onClick={() => setSheetOpen(false)}>
                  {t("mobile.wrapped.labels.done")}
                </Button>
              </Group>
              <SegmentedControl
                fullWidth
                value={sheetTab}
                onChange={(value) => setSheetTab(value as typeof sheetTab)}
                data={[
                  { label: t("mobile.wrapped.labels.format"), value: "format" },
                  {
                    label: t("mobile.wrapped.labels.backdrop"),
                    value: "backdrop",
                  },
                  { label: t("mobile.wrapped.labels.style"), value: "style" },
                ]}
              />
              <div
                className={
                  "-mx-2 overflow-y-auto overscroll-contain px-2 py-1 pb-2"
                }
                // Everything above (header, period, card, panel title and tabs) plus the floating tab bar
                // must stay on screen, so the controls scroll inside what is left.
                style={{
                  height: Math.max(140, viewportHeight * 0.74 - 252),
                }}
              >
                {sheetTab === "format" && (
                  <Stack gap={"lg"}>
                    {formatControl}
                    {templatePicker}
                  </Stack>
                )}
                {sheetTab === "backdrop" && backgroundControl}
                {sheetTab === "style" && (
                  <RecapCustomizePanel value={custom} onChange={setCustom} />
                )}
              </div>
            </div>
          )}
        </Transition>
      </div>
    );
  }

  return (
    <div className={"flex flex-col w-full max-w-6xl mx-auto p-4 mb-20 gap-6"}>
      <RecapCardFonts />
      <div className={"flex flex-wrap items-center justify-between gap-4"}>
        <Title order={2}>{t("mobile.wrapped.title")}</Title>
        {periodControl("w-full sm:w-72")}
      </div>

      {emptyMessage}
        {userId && <RecapStoreSync />}

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
            // theme-exempt: recap artwork background
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
            {previewContent}
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
              {templatePicker}
              {backgroundControl}

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
            {exportProgress}
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
            {exportStatus}
          </Stack>
        </div>
      </div>
    </div>
  );
};

export { WrappedRecapScreen };
