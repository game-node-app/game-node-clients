import {
  AwardsBallotCard,
  type AwardsBallotCardCategory,
} from "#@/components/awards/ballot/AwardsBallotCard";
import {
  AWARDS_BALLOT_FONT_FAMILY,
  AwardsBallotFonts,
  loadAwardsBallotFonts,
} from "#@/components/awards/ballot/AwardsBallotFonts";
import { useAwardsMobileLayout } from "#@/components/awards/shared/useAwardsMobileLayout";
import { RecapCardPreview } from "#@/components/wrapped/card/RecapCardPreview";
import { exportCardImage } from "#@/components/wrapped/util/exportCardImage";
import { useShareText } from "#@/context";
import { createErrorNotification, Modal } from "#@/util";
import { Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";

export interface AwardsBallotShareScreenProps {
  eventYear: number;
  userId: string;
  username?: string;
  categories: readonly AwardsBallotCardCategory[];
  totalCategories: number;
  gamesById: ReadonlyMap<number, Game>;
  onClose: () => void;
  onShare?: (file: File) => Promise<void>;
  onDownload?: (file: File) => Promise<void>;
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

/**
 * Share screen ("Cédula · Compartilhar", Figma `node 5580:21676`): wordmark +
 * close bar, "SUA CÉDULA" eyebrow, 0.24-scaled preview of the native 1080×1920
 * card, and the three actions (Compartilhar nos stories / Baixar imagem /
 * Copiar link da cédula).
 */
export function AwardsBallotShareScreen({
  eventYear,
  userId,
  username,
  categories,
  totalCategories,
  gamesById,
  onClose,
  onShare,
  onDownload,
}: AwardsBallotShareScreenProps) {
  const { t } = useTranslation();
  const shareText = useShareText();
  const cardRef = useRef<HTMLDivElement>(null);

  const exportImage = async () => {
    const node = cardRef.current;
    if (!node) {
      throw new Error(t("awards.ballot.shareModal.exportError"));
    }

    return exportCardImage(node, "story", {
      type: "image/png",
      filenamePrefix: `gamenode-awards-${eventYear}-ballot`,
      loadFonts: loadAwardsBallotFonts,
    });
  };

  const shareMutation = useMutation({
    mutationFn: async () => {
      const file = await exportImage();

      if (onShare) {
        await onShare(file);
        return;
      }

      if (!navigator.share) {
        throw new Error(t("awards.ballot.shareModal.shareUnsupported"));
      }
      const shareData = {
        title: t("awards.ballot.title"),
        files: [file],
      };
      if (navigator.canShare && !navigator.canShare(shareData)) {
        throw new Error(t("awards.ballot.shareModal.shareUnsupported"));
      }
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        throw error;
      }
    },
    onError: createErrorNotification,
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const file = await exportImage();

      if (onDownload) {
        await onDownload(file);
        return;
      }

      downloadFile(file);
    },
    onError: createErrorNotification,
  });

  const copyLink = async () => {
    const url = `https://gamenode.app/awards/${eventYear}/nominees/${userId}`;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard is not available");
      }
      await navigator.clipboard.writeText(url);
      notifications.show({ message: t("awards.ballot.linkCopied") });
      return;
    } catch {
      // Clipboard may be unavailable; fall back to text sharing.
    }

    try {
      await shareText(url);
    } catch (error) {
      createErrorNotification(error as Error);
    }
  };

  const pending = shareMutation.isPending || downloadMutation.isPending;

  return (
    <div
      data-awards-ballot-share-screen
      style={{
        backgroundColor: "#0b0b0b",
        minHeight: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: AWARDS_BALLOT_FONT_FAMILY,
        color: "#ffffff",
      }}
    >
      <AwardsBallotFonts />

      <div
        style={{
          paddingTop:
            "max(16px, var(--ion-safe-area-top, env(safe-area-inset-top, 0px)))",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 16,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <img
          src={"/img/awards/ballot-wordmark.svg"}
          alt={"GameNode"}
          style={{
            width: 106,
            height: 10.474,
            display: "block",
            flexShrink: 0,
          }}
        />
        <button
          type={"button"}
          data-awards-ballot-share-close
          aria-label={t("awards.ballot.shareModal.close")}
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={"/img/awards/ballot-close.svg"}
            alt={""}
            aria-hidden={"true"}
            style={{ width: 24, height: 24, display: "block" }}
          />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          paddingTop: 8,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
          flex: 1,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.72px",
            // theme-exempt: awards share artwork
            color: "#f7896d",
            textTransform: "uppercase",
            width: "100%",
            textAlign: "left",
            lineHeight: "normal",
          }}
        >
          {t("awards.ballot.shareModal.eyebrow")}
        </div>

        <RecapCardPreview
          format={"story"}
          cardRef={cardRef}
          scale={0.24}
          frameClassName={"shrink-0 overflow-hidden"}
          frameStyle={{
            borderRadius: 14,
            border: "1px solid #3d3d3d",
            boxSizing: "content-box",
          }}
          testId={"awards-ballot-card"}
        >
          <AwardsBallotCard
            eventYear={eventYear}
            username={username}
            categories={categories}
            totalCategories={totalCategories}
            gamesById={gamesById}
          />
        </RecapCardPreview>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
            maxWidth: 350,
          }}
        >
          <button
            type={"button"}
            data-awards-ballot-share-stories
            disabled={pending}
            aria-busy={shareMutation.isPending || undefined}
            onClick={() => shareMutation.mutate()}
            style={{
              // theme-exempt: awards share artwork
              backgroundColor: "#f15025",
              color: "#0b0b0b",
              borderRadius: 10,
              padding: "14px 22px",
              height: 48,
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.33,
              cursor: pending ? "not-allowed" : "pointer",
              opacity: pending ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
            }}
          >
            {shareMutation.isPending && <Loader size={16} color={"#0b0b0b"} />}
            <span>{t("awards.ballot.shareModal.shareStories")}</span>
          </button>

          <button
            type={"button"}
            data-awards-ballot-share-download
            disabled={pending}
            aria-busy={downloadMutation.isPending || undefined}
            onClick={() => downloadMutation.mutate()}
            style={{
              backgroundColor: "#262525",
              color: "#ffffff",
              border: "1px solid #3d3d3d",
              borderRadius: 10,
              padding: "14px 22px",
              height: 50,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.33,
              cursor: pending ? "not-allowed" : "pointer",
              opacity: pending ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {downloadMutation.isPending && (
              <Loader size={16} color={"#ffffff"} />
            )}
            <span>{t("awards.ballot.shareModal.downloadImage")}</span>
          </button>

          <button
            type={"button"}
            data-awards-ballot-share-copy
            onClick={() => void copyLink()}
            style={{
              backgroundColor: "transparent",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "14px 22px",
              height: 48,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.33,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <span>{t("awards.ballot.shareModal.copyLink")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export interface AwardsBallotShareModalProps
  extends AwardsBallotShareScreenProps {
  opened: boolean;
}

/**
 * Presents `AwardsBallotShareScreen` inside the injected `Modal`: centered
 * 390 px column on desktop, full-screen modal on mobile.
 */
export function AwardsBallotShareModal({
  opened,
  onClose,
  ...screenProps
}: AwardsBallotShareModalProps) {
  const { t } = useTranslation();
  const isMobileLayout = useAwardsMobileLayout();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={390}
      centered
      fullScreen={isMobileLayout}
      padding={0}
      radius={isMobileLayout ? 0 : 16}
      withCloseButton={false}
      aria-label={t("awards.ballot.shareModal.eyebrow")}
      classNames={{
        content: isMobileLayout
          ? "overflow-hidden bg-[#0b0b0b]"
          : "overflow-hidden border border-solid border-[#2a2a2a] bg-[#0b0b0b] sm:max-h-[calc(100dvh-2rem)]",
        body: "h-full overflow-y-auto bg-[#0b0b0b] p-0",
      }}
    >
      {opened && <AwardsBallotShareScreen onClose={onClose} {...screenProps} />}
    </Modal>
  );
}
