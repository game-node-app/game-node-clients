import {
  ActionIcon,
  Box,
  Group,
  Kbd,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconChevronLeft, IconX } from "@tabler/icons-react";
import { PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import { getSettingsSectionId } from "#@/components/settings/settingsTabs";

interface Props extends PropsWithChildren {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Section to scroll into view (from `?section=`). */
  section?: string | null;
  /** Called with the section currently at the top of the viewport (scroll-spy). */
  onSectionInView?: (section: string) => void;
  onClose: () => void;
  /** Shown on mobile, where the panel replaces the sidebar. */
  onBack?: () => void;
  /** Changes whenever the visible tab changes, so the scroll resets. */
  scrollKey?: string;
}

/** Right column of the settings modal: fixed header and scrollable body. */
export function SettingsPanel({
  title,
  subtitle,
  section,
  onSectionInView,
  onClose,
  onBack,
  scrollKey,
  children,
}: Props) {
  const { t } = useTranslation();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0 });
  }, [scrollKey]);

  useEffect(() => {
    if (!section) return;
    const target = viewportRef.current?.querySelector<HTMLElement>(
      `#${getSettingsSectionId(section)}`,
    );
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section, scrollKey]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !onSectionInView) return;

    const onScroll = () => {
      const sections = viewport.querySelectorAll<HTMLElement>(
        "[data-settings-section]",
      );
      const top = viewport.getBoundingClientRect().top;
      let current: string | undefined;
      sections.forEach((element) => {
        if (element.getBoundingClientRect().top - top <= 48) {
          current = element.dataset.settingsSection;
        }
      });
      // Short last sections never reach the top: at the bottom, the last one is the active one.
      const atBottom =
        viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;
      if (atBottom && sections.length > 0) {
        current = sections[sections.length - 1].dataset.settingsSection;
      }
      if (current) onSectionInView(current);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [onSectionInView, scrollKey]);

  return (
    <Stack gap={0} className={"h-full min-w-0 flex-1"}>
      <Group
        wrap={"nowrap"}
        align={"flex-start"}
        gap={24}
        className={
          "border-0 border-b border-solid border-[#2a2a2a] pb-4 pe-4 ps-8 pt-[18px] max-sm:ps-4"
        }
      >
        {onBack && (
          <ActionIcon
            variant={"subtle"}
            color={"gray"}
            size={32}
            onClick={onBack}
            aria-label={t("navigation.back")}
            className={"-me-3"}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
        )}
        <Stack gap={4} className={"min-w-0 flex-1"}>
          {/* Mantine focuses `data-autofocus` on open: the title, not the first sidebar button. */}
          <Text
            component={"h2"}
            fz={20}
            fw={500}
            c={"white"}
            lh={"normal"}
            tabIndex={-1}
            data-autofocus
            className={"focus-visible:outline-none"}
          >
            {title}
          </Text>
          {subtitle && (
            <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
              {subtitle}
            </Text>
          )}
        </Stack>
        <Group gap={8} wrap={"nowrap"} className={"shrink-0"}>
          <Kbd
            className={
              "border-[#2a2a2a] bg-[#222] px-1.5 py-0.5 text-[11px] font-medium text-[#adadad] max-sm:hidden"
            }
          >
            Esc
          </Kbd>
          <ActionIcon
            size={32}
            radius={8}
            variant={"default"}
            onClick={onClose}
            aria-label={t("settings.close")}
            className={"border-0 bg-[#222] hover:bg-[#2a2a2a]"}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <Box className={"relative min-h-0 flex-1"}>
        <ScrollArea
          h={"100%"}
          viewportRef={viewportRef}
          scrollbarSize={4}
          type={"hover"}
        >
          <Stack gap={32} className={"px-8 pb-10 pt-7 max-sm:px-4"}>
            {children}
          </Stack>
        </ScrollArea>
        <Box
          className={
            "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0b0b0b] to-transparent"
          }
        />
      </Box>
    </Stack>
  );
}
