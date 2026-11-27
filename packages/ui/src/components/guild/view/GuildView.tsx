import { useTranslation } from "@repo/locales";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useAuthPath } from "#@/context";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import { useGuildAccess } from "../hooks/useGuildAccess";
import { GuildFonts } from "../scene/GuildFonts";
import { GuildEarlyAccess } from "./GuildEarlyAccess";
import { GuildHall } from "./GuildHall";
import { GuildHallSkeleton } from "./GuildHallSkeleton";
import { GuildQueryError } from "./GuildQueryError";
import { GuildSignInPrompt } from "./GuildSignInPrompt";
import type { GuildTab } from "./GuildTabs";

export interface GuildViewProps {
  /** The app's supporter offer: web `/premium`, mobile `/preferences/supporter`. */
  supporterHref: string;
  /** Defaults to the app's auth path (`authPath ?? "/auth"`). */
  signInHref?: string;
  initialTab?: GuildTab;
  /** Bounty row highlighted by the `guild.community-bounty-ready` deep link. */
  bountyId?: string | null;
  className?: string;
}

/**
 * Entry point of the Guild screen. It follows the server-driven access gate
 * (spec guild-access): a guest sees the sign-in prompt, a signed-in player
 * without access sees the supporter early-access screen, and only
 * `hasAccess: true` mounts the Guild Hall and its player requests.
 */
export function GuildView({
  supporterHref,
  signInHref,
  initialTab = "board",
  bountyId,
  className,
}: GuildViewProps) {
  const { t } = useTranslation();
  const userId = useUserId();
  const access = useGuildAccess();
  const authPath = useAuthPath();
  const resolvedSignInHref = signInHref ?? authPath;

  let content;

  if (access.isPending && !access.data) {
    content = <GuildHallSkeleton />;
  } else if (access.isError && !access.data) {
    content = (
      <GuildQueryError
        error={access.error}
        message={t("guild.errors.accessUnavailable")}
        onRetry={() => {
          void access.refetch();
        }}
        isRetrying={access.isFetching}
      />
    );
  } else if (access.data?.hasAccess) {
    content = <GuildHall initialTab={initialTab} initialBountyId={bountyId} />;
  } else if (userId) {
    content = <GuildEarlyAccess supporterHref={supporterHref} />;
  } else {
    content = <GuildSignInPrompt signInHref={resolvedSignInHref} />;
  }

  return (
    <div className={cn(styles.root, styles.view, className)}>
      <GuildFonts />
      {content}
    </div>
  );
}
