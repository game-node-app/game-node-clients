import { ActionIcon, Box, Group } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useSettingsModalState } from "#@/components/settings/hooks/useSettingsModalState";
import { SettingsPanel } from "#@/components/settings/SettingsPanel";
import { SettingsSidebar } from "#@/components/settings/SettingsSidebar";
import { SettingsTabContent } from "#@/components/settings/SettingsTabContent";
import { SettingsTab } from "#@/components/settings/settingsTabs";
import { Modal } from "#@/util";

interface ContentProps {
  tab: SettingsTab;
  section: string | null;
  onMobile: boolean;
  select: (tab: SettingsTab, section?: string) => void;
  close: () => void;
}

/** Rendered only while the modal is open, so its local state resets on close. */
function SettingsModalContent({
  tab,
  section,
  onMobile,
  select,
  close,
}: ContentProps) {
  const { t } = useTranslation();
  /** Scroll-spy result, tied to the tab/section it was measured for. */
  const [spy, setSpy] = useState<{ key: string; section: string } | null>(null);
  /** On mobile the sidebar and the panel are separate screens; opening lands on the tab list. */
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const spyKey = `${tab}:${section ?? ""}`;
  const activeSection = spy?.key === spyKey ? spy.section : section;

  const showSidebar = !onMobile || showMobileMenu;
  const showPanel = !onMobile || !showMobileMenu;

  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Esc is handled here instead of by the Modal: nested modals (uploaders,
   * confirmations) are portals whose React events bubble up to this modal, so
   * only close when the key was pressed inside this modal's own DOM.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as Node | null;
      const root = rootRef.current;
      if (!root) return;
      if (target === document.body || (target && root.contains(target))) {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <Group
      ref={rootRef}
      gap={0}
      wrap={"nowrap"}
      align={"stretch"}
      className={"h-full"}
    >
      {showSidebar && (
        <Box
          className={
            onMobile ? "relative h-full w-full" : "h-full w-[216px] shrink-0"
          }
        >
          {onMobile && (
            <ActionIcon
              aria-label={t("settings.close")}
              onClick={close}
              variant="subtle"
              color="gray"
              className="absolute right-4 top-4 z-10"
            >
              <IconX size={18} />
            </ActionIcon>
          )}
          <SettingsSidebar
            activeTab={onMobile ? null : tab}
            activeSection={activeSection}
            onSelect={(nextTab, nextSection) => {
              setShowMobileMenu(false);
              select(nextTab, nextSection);
            }}
          />
        </Box>
      )}
      {showPanel && (
        <SettingsPanel
          title={t(`settings.tabs.${tab}.title`)}
          subtitle={t(`settings.tabs.${tab}.subtitle`)}
          section={section}
          scrollKey={tab}
          onSectionInView={(inView) =>
            setSpy((prev) =>
              prev?.key === spyKey && prev.section === inView
                ? prev
                : { key: spyKey, section: inView },
            )
          }
          onClose={close}
          onBack={onMobile ? () => setShowMobileMenu(true) : undefined}
        >
          <SettingsTabContent tab={tab} />
        </SettingsPanel>
      )}
    </Group>
  );
}

/**
 * Settings modal, opened through `?settings=<tab>` (see `useSettingsModalState`).
 * Mount it once in the app shell; it renders nothing for signed-out users.
 */
export function SettingsModal() {
  const { t } = useTranslation();
  const userId = useUserId();
  const onMobile = useOnMobile();
  const { opened, tab, section, select, close } = useSettingsModalState();

  return (
    <Modal
      opened={opened && !!userId && tab !== null}
      onClose={close}
      size={960}
      padding={0}
      radius={onMobile ? 0 : 16}
      centered
      fullScreen={onMobile}
      withCloseButton={false}
      closeOnEscape={false}
      aria-label={t("settings.title")}
      classNames={{
        content:
          "overflow-hidden border border-solid border-[#2a2a2a] bg-[#0b0b0b] shadow-[0_32px_80px_0_rgba(0,0,0,0.55)] sm:h-[720px] sm:max-h-[calc(100dvh-4rem)]",
        body: "h-full p-0",
      }}
    >
      {tab && (
        <SettingsModalContent
          tab={tab}
          section={section}
          onMobile={onMobile}
          select={select}
          close={close}
        />
      )}
    </Modal>
  );
}
