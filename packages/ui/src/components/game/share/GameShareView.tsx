import {
  GameShareSegmented,
  GameShareToggleChip,
} from "#@/components/game/share/GameShareControls";
import { GameShareCard } from "#@/components/game/share/GameShareCard";
import { loadGameShareFonts } from "#@/components/game/share/GameShareFonts";
import {
  DEFAULT_GAME_SHARE_BLOCKS,
  GAME_SHARE_BLOCKS,
  type GameShareBackground,
  type GameShareBlock,
  type GameShareBlocks,
  getAvailableBlocks,
} from "#@/components/game/share/gameShareModel";
import { useGameShareData } from "#@/components/game/share/useGameShareData";
import { RecapCardPreview } from "#@/components/wrapped/card/RecapCardPreview";
import {
  RECAP_CARD_FORMATS,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import { exportCardImage } from "#@/components/wrapped/util/exportCardImage";
import { useSaveFile, useShareFile, useShareText } from "#@/context";
import { cn, createErrorNotification } from "#@/util";
import { ActionIcon, Button, Skeleton, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";

export interface GameShareViewProps {
  gameId: number;
  /** Phone layout: one scrolling column and a fixed action bar. */
  compact: boolean;
  onClose: () => void;
}

/** Tallest the preview gets: it fits the desktop stage or one phone screen. */
const PREVIEW_MAX_HEIGHT = { desktop: 576, compact: 422.4 } as const;

/** Some themes set labels in tracked capitals; let them wrap instead of clipping. */
const SECONDARY_ACTION_CLASSES = {
  label: "whitespace-normal text-center leading-tight py-1",
} as const;

const CHECKERBOARD =
  "repeating-conic-gradient(var(--gn-paper-1) 0% 25%, var(--gn-paper-2) 0% 50%) 0 0 / 24px 24px";

/**
 * Share screen of a game ("Compartilhar jogo", Figma node 5702:21082): the card
 * preview, what goes on it and what is behind it, and the share/download/link
 * actions. Open to everyone: it only needs the game, and every personal block
 * (rating, playtime, achievements, platforms, library status, @handle) is left
 * out when the viewer is signed out, does not own the game or never reviewed it.
 */
export function GameShareView({
  gameId,
  compact,
  onClose,
}: GameShareViewProps) {
  const { t } = useTranslation();
  const shareFile = useShareFile();
  const shareText = useShareText();
  const saveFile = useSaveFile();
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const { data, isLoading } = useGameShareData(gameId);
  const ready = !!data.game;

  const [format, setFormat] = useState<RecapCardFormat>("story");
  const [background, setBackground] = useState<GameShareBackground>("art");
  const [blocks, setBlocks] = useState<GameShareBlocks>(
    DEFAULT_GAME_SHARE_BLOCKS,
  );

  const availableBlocks = getAvailableBlocks(data);
  const switchableBlocks = GAME_SHARE_BLOCKS.filter(
    (block) => availableBlocks[block],
  );

  const exportImage = async () => {
    const node = cardRef.current;
    if (!node) {
      throw new Error(t("game.share.messages.generateFailed"));
    }

    return exportCardImage(node, format, {
      type: "image/png",
      filenamePrefix: `gamenode-game-${gameId}`,
      loadFonts: loadGameShareFonts,
    });
  };

  const shareMutation = useMutation({
    mutationFn: async () => {
      const file = await exportImage();
      await shareFile({
        file,
        title: t("game.share.title"),
        text: t("game.share.seeMoreAt", { gameId }),
        url: `https://gamenode.app/game/${gameId}`,
      });
    },
    onError: createErrorNotification,
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const file = await exportImage();
      const savedByApp = await saveFile(file);
      if (savedByApp) {
        notifications.show({ message: t("game.share.messages.saved") });
      }
    },
    onError: createErrorNotification,
  });

  const copyLink = async () => {
    const url = `https://gamenode.app/game/${gameId}`;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard is not available");
      }
      await navigator.clipboard.writeText(url);
      notifications.show({ message: t("game.share.messages.linkCopied") });
      return;
    } catch {
      // Clipboard may be unavailable; fall back to sharing the text.
    }

    try {
      await shareText(url);
    } catch (error) {
      createErrorNotification(error as Error);
    }
  };

  const pending = shareMutation.isPending || downloadMutation.isPending;
  const actionsDisabled = !ready || pending;

  const blockLabels: Record<GameShareBlock, string> = {
    rating: t("game.share.options.rating"),
    playtime: t("game.share.options.playtime"),
    achievements: t("game.share.options.achievements"),
    platforms: t("game.share.options.ownedPlatforms"),
  };

  const formatSwitch = (
    <GameShareSegmented
      ariaLabel={t("game.share.sections.format")}
      value={format}
      onChange={setFormat}
      className={compact ? undefined : "bg-body"}
      options={(Object.keys(RECAP_CARD_FORMATS) as RecapCardFormat[]).map(
        (key) => ({
          value: key,
          label: (
            <>
              <span>{t(`game.share.formats.${key}`)}</span>
              <span className={"text-[11px] font-normal text-muted"}>
                {`${RECAP_CARD_FORMATS[key].width}×${RECAP_CARD_FORMATS[key].height}`}
              </span>
            </>
          ),
        }),
      )}
    />
  );

  const preview = (
    <div
      role={"img"}
      aria-label={t("game.share.previewLabel", { name: data.name })}
      className={"flex w-full justify-center"}
    >
      {ready ? (
        <RecapCardPreview
          format={format}
          cardRef={cardRef}
          maxHeight={
            compact ? PREVIEW_MAX_HEIGHT.compact : PREVIEW_MAX_HEIGHT.desktop
          }
          frameClassName={"shrink-0 overflow-hidden"}
          frameStyle={{
            borderRadius: compact ? 9 : 12,
            border: "1px solid var(--gn-line)",
            boxSizing: "content-box",
            background: background === "transparent" ? CHECKERBOARD : undefined,
          }}
          testId={"game-share-card"}
        >
          <GameShareCard
            data={data}
            blocks={blocks}
            format={format}
            background={background}
          />
        </RecapCardPreview>
      ) : (
        <Skeleton
          visible={isLoading}
          h={compact ? PREVIEW_MAX_HEIGHT.compact : PREVIEW_MAX_HEIGHT.desktop}
          w={compact ? 237.6 : 324}
          radius={12}
        />
      )}
    </div>
  );

  const onCard = switchableBlocks.length > 0 && (
    <section
      aria-labelledby={`${titleId}-on-card`}
      className={"flex w-full flex-col gap-2.5"}
    >
      <Text
        id={`${titleId}-on-card`}
        className={"text-[13px] font-semibold text-subtle"}
      >
        {t("game.share.sections.onCard")}
      </Text>
      <div className={"flex flex-wrap gap-2"}>
        {switchableBlocks.map((block) => (
          <GameShareToggleChip
            key={block}
            checked={blocks[block]}
            onChange={(checked) =>
              setBlocks((current) => ({ ...current, [block]: checked }))
            }
          >
            {blockLabels[block]}
          </GameShareToggleChip>
        ))}
      </div>
    </section>
  );

  const backgroundControl = (
    <section
      aria-labelledby={`${titleId}-background`}
      className={"flex w-full flex-col gap-2.5"}
    >
      <Text
        id={`${titleId}-background`}
        className={"text-[13px] font-semibold text-subtle"}
      >
        {t("game.share.sections.background")}
      </Text>
      <GameShareSegmented
        ariaLabel={t("game.share.sections.background")}
        value={background}
        onChange={setBackground}
        options={[
          { value: "art", label: t("game.share.backgrounds.art") },
          { value: "plain", label: t("game.share.backgrounds.plain") },
          {
            value: "transparent",
            label: t("game.share.backgrounds.transparent"),
          },
        ]}
      />
    </section>
  );

  const actions = (
    <div className={"flex w-full flex-col gap-2.5"}>
      <Button
        fullWidth
        h={48}
        radius={10}
        fw={600}
        fz={15}
        loading={shareMutation.isPending}
        disabled={actionsDisabled}
        onClick={() => shareMutation.mutate()}
      >
        {t("actions.share")}
      </Button>
      <div className={"flex gap-2.5"}>
        <Button
          variant={"default"}
          className={"min-w-0 flex-1"}
          classNames={SECONDARY_ACTION_CLASSES}
          h={"auto"}
          mih={48}
          radius={10}
          fw={600}
          fz={15}
          loading={downloadMutation.isPending}
          disabled={actionsDisabled}
          onClick={() => downloadMutation.mutate()}
        >
          {t("game.share.actions.downloadImage")}
        </Button>
        <Button
          variant={"default"}
          className={"min-w-0 flex-1"}
          classNames={SECONDARY_ACTION_CLASSES}
          h={"auto"}
          mih={48}
          radius={10}
          fw={600}
          fz={15}
          onClick={() => void copyLink()}
        >
          {t("game.share.actions.copyLink")}
        </Button>
      </div>
    </div>
  );

  const closeButton = (
    <ActionIcon
      variant={"subtle"}
      color={"gray"}
      size={"lg"}
      aria-label={t("actions.close")}
      onClick={onClose}
    >
      <IconX size={24} />
    </ActionIcon>
  );

  if (compact) {
    return (
      <div
        data-testid={"game-share-screen"}
        className={"flex h-full min-h-0 w-full flex-col bg-body"}
      >
        <div
          className={"flex items-center justify-between px-4 pb-3"}
          style={{
            paddingTop:
              "calc(16px + var(--ion-safe-area-top, env(safe-area-inset-top, 0px)))",
          }}
        >
          <Text
            component={"h2"}
            id={titleId}
            className={"m-0 text-xl font-bold text-emphasis"}
          >
            {t("game.labels.share")}
          </Text>
          {closeButton}
        </div>
        <div
          className={
            "flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto px-5 pb-6 pt-1"
          }
        >
          {formatSwitch}
          {preview}
          {onCard}
          {backgroundControl}
        </div>
        <div
          className={
            "border-0 border-t border-solid border-line bg-body px-5 pt-3"
          }
          style={{
            paddingBottom:
              "calc(16px + var(--ion-safe-area-bottom, env(safe-area-inset-bottom, 0px)))",
          }}
        >
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div data-testid={"game-share-screen"} className={"flex w-full bg-body"}>
      <div
        className={cn(
          "flex w-[436px] shrink-0 flex-col items-center gap-5 bg-paper-0 px-14 py-10",
        )}
      >
        <div className={"w-[300px]"}>{formatSwitch}</div>
        {preview}
      </div>
      <div className={"flex w-[380px] shrink-0 flex-col gap-7 p-8"}>
        <div className={"flex items-start justify-between"}>
          <div className={"flex min-w-0 flex-col gap-1"}>
            <Text
              component={"h2"}
              id={titleId}
              className={"m-0 text-[22px] font-bold text-emphasis"}
            >
              {t("game.labels.share")}
            </Text>
            <Text className={"truncate text-sm text-subtle"}>{data.name}</Text>
          </div>
          {closeButton}
        </div>
        {onCard}
        {backgroundControl}
        <div className={"min-h-0 flex-1"} />
        {actions}
      </div>
    </div>
  );
}
