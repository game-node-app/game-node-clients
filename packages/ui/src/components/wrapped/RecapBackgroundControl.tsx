import { getRecapBackdropImages } from "#@/components/wrapped/card/recapBackdropImages";
import type { RecapCustomization } from "#@/components/wrapped/card/recapCustomization";
import { RECAP_CAPTION_PROPS } from "#@/components/wrapped/recapControlStyles";
import { cn } from "#@/util";
import {
  Button,
  FileButton,
  Group,
  Loader,
  NumberInput,
  Select,
  Slider,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import {
  IconDeviceGamepad2,
  IconPhoto,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

/** What fills the top of the card: the game's art, a photo or a clip. */
export type RecapBackground = "art" | "photo" | "video";

const AUTO = "auto";
const BACKGROUNDS: RecapBackground[] = ["art", "photo", "video"];
const BACKGROUND_ICONS: Record<RecapBackground, ReactNode> = {
  art: <IconDeviceGamepad2 size={20} aria-hidden />,
  photo: <IconPhoto size={20} aria-hidden />,
  video: <IconVideo size={20} aria-hidden />,
};
const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm";

interface PercentFieldProps {
  label: string;
  /** From 0 to 1. */
  value: number;
  onChange: (next: number) => void;
  hint?: string;
}

/** A slider with the value in an input next to it, for precise choices. */
function PercentField({ label, value, onChange, hint }: PercentFieldProps) {
  const percent = Math.round(value * 100);

  return (
    <Stack gap={8}>
      <Group justify={"space-between"} wrap={"nowrap"}>
        <Text size={"sm"} fw={500}>
          {label}
        </Text>
        <NumberInput
          aria-label={`${label} (%)`}
          size={"xs"}
          w={84}
          min={0}
          max={100}
          step={5}
          suffix={"%"}
          allowDecimal={false}
          hideControls
          clampBehavior={"strict"}
          value={percent}
          onChange={(next) => {
            if (typeof next === "number") onChange(next / 100);
          }}
        />
      </Group>
      <Slider
        min={0}
        max={100}
        step={1}
        size={"md"}
        thumbSize={22}
        label={null}
        aria-label={label}
        value={percent}
        onChange={(next) => onChange(next / 100)}
      />
      {hint && (
        <Text size={"xs"} c={"dimmed"}>
          {hint}
        </Text>
      )}
    </Stack>
  );
}

interface DropzoneProps {
  accept: string;
  title: string;
  hint: string;
  icon: ReactNode;
  loading?: boolean;
  onPick: (file: File) => void;
}

/** Empty state of a media control: one big target that opens the picker. */
function MediaDropzone({
  accept,
  title,
  hint,
  icon,
  loading,
  onPick,
}: DropzoneProps) {
  return (
    <FileButton
      accept={accept}
      onChange={(file) => file && onPick(file)}
      disabled={loading}
    >
      {(props) => (
        <UnstyledButton
          {...props}
          className={
            "flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-4 py-3 text-center transition-colors hover:border-white/40 hover:bg-white/[0.06]"
          }
        >
          {loading ? <Loader size={20} /> : icon}
          <Text size={"sm"} fw={600}>
            {title}
          </Text>
          <Text size={"xs"} c={"dimmed"}>
            {hint}
          </Text>
        </UnstyledButton>
      )}
    </FileButton>
  );
}

interface MediaRowProps {
  accept: string;
  preview: ReactNode;
  name?: string;
  replaceLabel: string;
  removeLabel: string;
  loading?: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}

/** Filled state of a media control: a thumbnail with replace and remove. */
function MediaRow({
  accept,
  preview,
  name,
  replaceLabel,
  removeLabel,
  loading,
  onPick,
  onRemove,
}: MediaRowProps) {
  return (
    <Group wrap={"nowrap"} gap={"sm"} align={"center"}>
      <div
        className={
          "h-14 w-24 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40"
        }
      >
        {preview}
      </div>
      <Stack gap={6} className={"min-w-0 flex-1"}>
        {name && (
          <Text size={"sm"} fw={500} truncate>
            {name}
          </Text>
        )}
        <Group gap={"xs"} wrap={"nowrap"}>
          <FileButton
            accept={accept}
            onChange={(file) => file && onPick(file)}
            disabled={loading}
          >
            {(props) => (
              <Button
                {...props}
                variant={"default"}
                size={"compact-sm"}
                loading={loading}
              >
                {replaceLabel}
              </Button>
            )}
          </FileButton>
          <Button
            variant={"subtle"}
            color={"red"}
            size={"compact-sm"}
            leftSection={<IconX size={14} aria-hidden />}
            onClick={onRemove}
          >
            {removeLabel}
          </Button>
        </Group>
      </Stack>
    </Group>
  );
}

interface GalleryProps {
  label: string;
  images: { url: string; thumb: string }[];
  selected: string | undefined;
  getImageLabel: (number: number) => string;
  onSelect: (url: string) => void;
}

/** The official images of the game, to pick the one behind the card. */
function BackdropGallery({
  label,
  images,
  selected,
  getImageLabel,
  onSelect,
}: GalleryProps) {
  return (
    <Stack gap={8}>
      <Text size={"sm"} fw={500}>
        {label}
      </Text>
      <div
        role={"radiogroup"}
        aria-label={label}
        className={
          "grid max-h-36 auto-rows-max grid-cols-3 gap-2 overflow-y-auto p-0.5"
        }
      >
        {images.map((image, index) => {
          const active = image.url === selected;
          return (
            <UnstyledButton
              key={image.url}
              role={"radio"}
              aria-checked={active}
              aria-label={getImageLabel(index + 1)}
              onClick={() => onSelect(image.url)}
              className={cn(
                "aspect-video overflow-hidden rounded-md bg-black/40 transition-shadow",
                active
                  ? "ring-2 ring-brand"
                  : "ring-1 ring-white/10 hover:ring-white/30",
              )}
            >
              <img
                src={image.thumb}
                alt={""}
                loading={"lazy"}
                className={"h-full w-full object-cover"}
              />
            </UnstyledButton>
          );
        })}
      </div>
    </Stack>
  );
}

interface Props {
  value: RecapBackground;
  onChange: (next: RecapBackground) => void;
  /** Restores the customization and drops the media. */
  onReset: () => void;

  /** Games that can provide the art, in ranking order. */
  games: Game[];
  custom: RecapCustomization;
  onCustomChange: (next: RecapCustomization) => void;
  /** Art opacity the template uses until the user moves the slider. */
  defaultOpacity: number;
  /** Blur the template uses until the user moves the slider, in pixels. */
  defaultBlur: number;

  photoUrl: string | null;
  photoLoading: boolean;
  onPickPhoto: (file: File) => void;
  onRemovePhoto: () => void;

  videoSupported: boolean;
  videoFile: File | null;
  videoUrl: string | null;
  videoMaxSeconds: number;
  onPickVideo: (file: File | null) => void;

  /** Darkness of the overlay over a photo or clip, from 0 to 1. */
  overlay: number;
  onOverlayChange: (next: number) => void;
}

/**
 * Background of the card in one place: a choice between the game's art, a
 * photo and a clip, and only the controls that apply to the choice. Picked
 * files are kept when the user switches back and forth.
 */
export function RecapBackgroundControl({
  value,
  onChange,
  onReset,
  games,
  custom,
  onCustomChange,
  defaultOpacity,
  defaultBlur,
  photoUrl,
  photoLoading,
  onPickPhoto,
  onRemovePhoto,
  videoSupported,
  videoFile,
  videoUrl,
  videoMaxSeconds,
  onPickVideo,
  overlay,
  onOverlayChange,
}: Props) {
  const { t } = useTranslation();
  const artOpacity = custom.backdropOpacity ?? defaultOpacity;
  const artBlur = custom.backdropBlur ?? defaultBlur;
  // The art comes from the game picked, or from the most played one.
  const artGame =
    games.find((game) => game.id === custom.backdropGameId) ?? games[0];
  const artImages = getRecapBackdropImages(artGame);
  const artImage = artImages.some(
    (image) => image.url === custom.backdropImageUrl,
  )
    ? custom.backdropImageUrl!
    : artImages[0]?.url;
  const hasMedia =
    (value === "photo" && !!photoUrl) || (value === "video" && !!videoFile);

  const overlayField = (
    <PercentField
      label={t("mobile.wrapped.custom.overlay")}
      value={overlay}
      onChange={onOverlayChange}
      hint={t("mobile.wrapped.custom.overlayHint")}
    />
  );

  return (
    <Stack gap={"md"} data-testid={"recap-background"}>
      <Group justify={"space-between"} wrap={"nowrap"}>
        <Text {...RECAP_CAPTION_PROPS}>
          {t("mobile.wrapped.background.title")}
        </Text>
        <Button variant={"subtle"} size={"compact-xs"} onClick={onReset}>
          {t("mobile.wrapped.custom.reset")}
        </Button>
      </Group>

      <div role={"radiogroup"} className={"grid grid-cols-3 gap-2"}>
        {BACKGROUNDS.map((option) => {
          const active = option === value;
          const label = t(`mobile.wrapped.background.${option}`);
          return (
            <UnstyledButton
              key={option}
              role={"radio"}
              aria-checked={active}
              aria-label={label}
              onClick={() => onChange(option)}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors",
                active
                  ? "border-brand bg-brand/10 font-semibold text-white"
                  : "border-white/10 bg-white/[0.03] text-[#9A9A9A] hover:border-white/25 hover:text-white",
              )}
            >
              {BACKGROUND_ICONS[option]}
              {label}
            </UnstyledButton>
          );
        })}
      </div>

      {value === "art" && (
        <Stack gap={"md"}>
          <Select
            label={t("mobile.wrapped.custom.backdropGame")}
            allowDeselect={false}
            data={[
              { value: AUTO, label: t("mobile.wrapped.custom.backdropAuto") },
              ...games.map((game) => ({
                value: `${game.id}`,
                label: game.name,
              })),
            ]}
            value={
              custom.backdropGameId == null ? AUTO : `${custom.backdropGameId}`
            }
            onChange={(next) =>
              onCustomChange({
                ...custom,
                backdropGameId:
                  next == null || next === AUTO ? null : Number(next),
                // The images belong to a game: start over with its own.
                backdropImageUrl: null,
              })
            }
          />
          {artImages.length > 1 && (
            <BackdropGallery
              label={t("mobile.wrapped.background.images")}
              images={artImages}
              selected={artImage}
              getImageLabel={(number) =>
                t("mobile.wrapped.background.imageOption", { number })
              }
              onSelect={(url) =>
                onCustomChange({ ...custom, backdropImageUrl: url })
              }
            />
          )}
          <PercentField
            label={t("mobile.wrapped.custom.blur")}
            value={artBlur / 100}
            onChange={(next) =>
              onCustomChange({
                ...custom,
                backdropBlur: Math.round(next * 100),
              })
            }
          />
          <PercentField
            label={t("mobile.wrapped.custom.opacity")}
            value={artOpacity}
            onChange={(next) =>
              onCustomChange({ ...custom, backdropOpacity: next })
            }
          />
          {custom.backdropOpacity != null && (
            <Button
              variant={"subtle"}
              size={"compact-xs"}
              className={"self-start"}
              onClick={() =>
                onCustomChange({ ...custom, backdropOpacity: null })
              }
            >
              {t("mobile.wrapped.custom.resetOpacity")}
            </Button>
          )}
        </Stack>
      )}

      {value === "photo" && (
        <Stack gap={"md"}>
          {photoUrl ? (
            <MediaRow
              accept={PHOTO_ACCEPT}
              preview={
                <img
                  src={photoUrl}
                  alt={""}
                  className={"h-full w-full object-cover"}
                />
              }
              replaceLabel={t("mobile.wrapped.media.replace")}
              removeLabel={t("mobile.wrapped.photo.remove")}
              loading={photoLoading}
              onPick={onPickPhoto}
              onRemove={onRemovePhoto}
            />
          ) : (
            <MediaDropzone
              accept={PHOTO_ACCEPT}
              icon={<IconPhoto size={24} aria-hidden />}
              title={t("mobile.wrapped.photo.pick")}
              hint={t("mobile.wrapped.photo.formats")}
              loading={photoLoading}
              onPick={onPickPhoto}
            />
          )}
          {hasMedia && overlayField}
        </Stack>
      )}

      {value === "video" && (
        <Stack gap={"md"}>
          {!videoSupported ? (
            <Text size={"sm"} c={"dimmed"}>
              {t("mobile.wrapped.video.unsupported")}
            </Text>
          ) : videoFile ? (
            <MediaRow
              accept={VIDEO_ACCEPT}
              preview={
                videoUrl ? (
                  <video
                    src={videoUrl}
                    muted
                    playsInline
                    preload={"metadata"}
                    className={"h-full w-full object-cover"}
                  />
                ) : null
              }
              name={videoFile.name}
              replaceLabel={t("mobile.wrapped.media.replace")}
              removeLabel={t("mobile.wrapped.video.remove")}
              onPick={onPickVideo}
              onRemove={() => onPickVideo(null)}
            />
          ) : (
            <MediaDropzone
              accept={VIDEO_ACCEPT}
              icon={<IconVideo size={24} aria-hidden />}
              title={t("mobile.wrapped.video.pick")}
              hint={t("mobile.wrapped.video.formats", {
                seconds: videoMaxSeconds,
              })}
              onPick={onPickVideo}
            />
          )}
          {hasMedia && overlayField}
        </Stack>
      )}
    </Stack>
  );
}
