import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { GameShareView } from "#@/components/game/share/GameShareView";
import { Modal } from "#@/util";
import { useTranslation } from "@repo/locales";

export interface GameShareModalProps {
  gameId: number;
  opened: boolean;
  onClose: () => void;
}

/**
 * Presents the game share screen in the injected `Modal`: two columns on
 * desktop (preview left, controls and actions right) and a full-screen modal
 * on mobile (Ionic's `ion-modal` there).
 */
export function GameShareModal({
  gameId,
  opened,
  onClose,
}: GameShareModalProps) {
  const { t } = useTranslation();
  const onMobile = useOnMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={818}
      centered
      fullScreen={onMobile}
      padding={0}
      radius={onMobile ? 0 : 16}
      withCloseButton={false}
      aria-label={t("game.labels.share")}
      classNames={{
        content: onMobile
          ? "overflow-hidden bg-body"
          : "overflow-hidden border border-solid border-line bg-body sm:max-h-[calc(100dvh-2rem)]",
        body: onMobile
          ? "h-full overflow-hidden bg-body p-0"
          : "overflow-y-auto bg-body p-0",
      }}
    >
      {opened && (
        <GameShareView gameId={gameId} compact={onMobile} onClose={onClose} />
      )}
    </Modal>
  );
}
