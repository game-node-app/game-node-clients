import { useTranslation } from "@repo/locales";
import {
  cn,
  type PostsFeedLayoutProps,
  type PostsFeedTabValue,
} from "@repo/ui";

/**
 * Mobile presenter for the posts feed layout: a segmented All/Following switch (Following is not
 * available yet) above the feed, with side padding so cards line up with the rest of the app.
 */
const MobilePostsFeedLayout = ({
  currentTab,
  onChange,
  children,
}: PostsFeedLayoutProps) => {
  const { t } = useTranslation();
  const tabs: {
    value: PostsFeedTabValue;
    label: string;
    disabled?: boolean;
  }[] = [
    { value: "all", label: t("posts.tabs.all") },
    {
      value: "following",
      label: t("posts.tabs.following"),
      disabled: true,
    },
  ];

  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-4 px-4">
      <div
        role="tablist"
        className="flex gap-1 rounded-xl border border-line bg-paper-8 p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={currentTab === tab.value}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border-0 px-3 py-2 text-sm font-semibold",
              currentTab === tab.value
                ? "bg-paper-4 text-white"
                : "bg-transparent text-dimmed-1",
              tab.disabled && "opacity-60",
            )}
          >
            {tab.label}
            {tab.disabled && (
              <span className="rounded-full bg-paper-4 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-dimmed-1">
                {t("posts.tabs.soon")}
              </span>
            )}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
};

export { MobilePostsFeedLayout };
