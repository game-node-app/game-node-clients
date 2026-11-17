import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import type { ProfileAvatar } from "@repo/wrapper/server";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { SupporterBadge } from "#@/components/supporter/perks/SupporterBadge";
import type { ActiveSupporterPerks } from "#@/components/supporter/perks/supporterPerks";
import { toPositionChange } from "#@/components/daily/ranking/rankingFormat";
import { cn } from "#@/util/cn";

/** Rankings only say whether the badge is on, so it always uses the default violet. */
const RANKING_BADGE_PERKS = { theme: false } as ActiveSupporterPerks;

export const DailyRankingBadge = ({
  show,
  className,
}: {
  show: boolean;
  className?: string;
}) =>
  show ? (
    <SupporterBadge
      variant={"full"}
      perks={RANKING_BADGE_PERKS}
      className={cn("h-[18px]", className)}
    />
  ) : null;

export const DailyRankingAvatar = ({
  userId,
  username,
  avatar,
  size,
  className,
}: {
  userId: string;
  username: string;
  avatar: ProfileAvatar | null;
  size: number;
  className?: string;
}) => (
  <UserAvatar
    userId={userId}
    profile={{ avatar }}
    name={username}
    color={"initials"}
    variant={"filled"}
    size={size}
    className={cn("shrink-0", className)}
  />
);

/** "↑ 3", "↓ 2", "new" or "–"; nothing when the period has no comparison (Today). */
export const DailyRankingChange = ({
  value,
}: {
  value: number | string | null | undefined;
}) => {
  const { t } = useTranslation();
  const change = toPositionChange(value);

  if (change.kind === "none") return null;
  if (change.kind === "new") {
    return (
      <Text component={"span"} fz={11} fw={700} className={"text-brand-5"}>
        {t("daily.ranking.change.new")}
      </Text>
    );
  }
  if (change.kind === "same") {
    return (
      <Text
        component={"span"}
        fz={12}
        fw={600}
        className={"text-[#7A7A7A]"}
        aria-label={t("daily.ranking.change.same")}
      >
        –
      </Text>
    );
  }
  const up = change.kind === "up";
  const Icon = up ? IconArrowUp : IconArrowDown;
  return (
    <Text
      component={"span"}
      fz={12}
      fw={600}
      c={up ? "teal.4" : "red.5"}
      className={"inline-flex items-center gap-0.5"}
      aria-label={t(
        up ? "daily.ranking.change.up" : "daily.ranking.change.down",
        {
          count: change.amount,
        },
      )}
    >
      <Icon size={12} stroke={2.5} aria-hidden />
      <span aria-hidden>{change.amount}</span>
    </Text>
  );
};

/** The accent "You" pill next to the viewer's name. */
export const DailyRankingYouPill = () => {
  const { t } = useTranslation();
  return (
    <span
      className={
        "shrink-0 rounded bg-brand-5 px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#0B0B0B]"
      }
    >
      {t("daily.ranking.you")}
    </span>
  );
};

export const DailyRankingName = ({
  username,
  supporterBadge,
  isViewer,
  fz = 14,
  children,
}: {
  username: string;
  supporterBadge: boolean;
  isViewer?: boolean;
  fz?: number;
  children?: ReactNode;
}) => (
  <span className={"flex min-w-0 items-center gap-1.5"}>
    <Text component={"span"} fz={fz} fw={600} c={"white"} truncate>
      {username}
    </Text>
    {isViewer ? (
      <DailyRankingYouPill />
    ) : (
      <DailyRankingBadge show={supporterBadge} />
    )}
    {children}
  </span>
);
