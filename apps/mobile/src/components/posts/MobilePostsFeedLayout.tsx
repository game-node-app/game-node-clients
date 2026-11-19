import type { PostsFeedLayoutProps } from "@repo/ui";

/**
 * Mobile presenter for the posts feed layout. There is no All/Following switch: Following does not
 * exist yet, and a disabled control that looks tappable is worse than none. Bring the switch back
 * when Following ships. The page (`AppPage`) owns the horizontal gutter.
 */
const MobilePostsFeedLayout = ({ children }: PostsFeedLayoutProps) => (
  <div className="flex h-full w-full min-w-0 flex-col gap-4">{children}</div>
);

export { MobilePostsFeedLayout };
