import { DockAccount } from "@/components/general/shell/navbar/DockAccount";
import { DockGroup } from "@/components/general/shell/navbar/DockGroup";
import { DockItem } from "@/components/general/shell/navbar/DockItem";
import {
  DOCK_GROUPS,
  DOCK_UTILITY_ITEMS,
  isDockItemActive,
  type DockItemDefinition,
} from "@/components/general/shell/navbar/dockItems";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  cn,
  NavChevronLeftIcon,
  NavChevronRightIcon,
  RecentlyPlayedGamesShare,
  useSettingsModalState,
  useUserId,
} from "@repo/ui";
import { useRouter } from "next/router";

interface Props {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Called after an item activation; the mobile drawer uses it to close. */
  onNavigate?: () => void;
}

/**
 * Navigation/Dock, open (5206:18785) and collapsed (5211:15029).
 * The shell owns width/sticky positioning; the Dock fills the available
 * height and scrolls only its groups area when the viewport is short.
 */
export function Dock({ collapsed, onToggleCollapsed, onNavigate }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useUserId();
  const settings = useSettingsModalState();
  const [wrappedOpened, wrappedUtils] = useDisclosure(false);

  const handleActivate = (item: DockItemDefinition) => {
    if (item.kind === "action") {
      if (item.action === "wrapped") {
        wrappedUtils.open();
      } else {
        settings.open("premium");
      }
    }

    onNavigate?.();
  };

  return (
    <nav
      aria-label={t("navigation.dock.title")}
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col gap-4 rounded-md border border-nav-border bg-nav-surface",
        collapsed ? "w-[72px] px-3 py-4" : "w-[248px] p-4",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center",
          collapsed ? "justify-center" : "gap-1",
        )}
      >
        {!collapsed && (
          <span className="flex-1 text-[14px] font-semibold leading-[normal] text-nav-text">
            {t("navigation.dock.title")}
          </span>
        )}
        <button
          type="button"
          aria-label={
            collapsed
              ? t("navigation.dock.expand")
              : t("navigation.dock.collapse")
          }
          aria-expanded={!collapsed}
          onClick={onToggleCollapsed}
          className={cn(
            "hidden size-10 shrink-0 items-center justify-center rounded-md text-nav-text md:flex",
            "hover:bg-nav-raised focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-brand-5",
          )}
        >
          {collapsed ? (
            <NavChevronRightIcon size={20} />
          ) : (
            <NavChevronLeftIcon size={20} />
          )}
        </button>
      </div>
      {/* -mr-2/pr-2 move the scrollbar into the Dock padding so it never overlaps the icons. */}
      <div className="-mr-2 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2 [scrollbar-width:thin]">
        {DOCK_GROUPS.map((group) => (
          <DockGroup
            key={group.id}
            label={t(group.labelKey)}
            collapsed={collapsed}
          >
            {group.items.map((item) => (
              <DockItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                active={isDockItemActive(item, router.pathname, router.query)}
                onActivate={handleActivate}
              />
            ))}
          </DockGroup>
        ))}
      </div>
      <div
        className={cn("flex shrink-0 flex-col", collapsed ? "gap-1" : "gap-4")}
      >
        {DOCK_UTILITY_ITEMS.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            active={isDockItemActive(item, router.pathname, router.query)}
            onActivate={handleActivate}
          />
        ))}
        {collapsed && userId && (
          <div aria-hidden="true" className="h-px w-full bg-nav-border" />
        )}
        <DockAccount collapsed={collapsed} onNavigate={onNavigate} />
      </div>
      <RecentlyPlayedGamesShare
        opened={wrappedOpened}
        onClose={wrappedUtils.close}
        onShare={async (file) => {
          const toShare: ShareData = {
            title: t("game.share.title"),
            text: t("game.share.recentlyPlayed"),
            files: [file],
            url: `https://gamenode.app`,
          };

          await navigator.share(toShare);
        }}
      />
    </nav>
  );
}
