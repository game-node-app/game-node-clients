import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import type { ProfileAvatar } from "@repo/wrapper/server";
import {
  DailyRankingAvatar,
  DailyRankingName,
} from "#@/components/daily/ranking/DailyRankingParts";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

interface Props {
  position: number;
  userId: string;
  username: string;
  avatar: ProfileAvatar | null;
  supporterBadge: boolean;
  /** Right-aligned: points, attempts or "not guessed". */
  value: ReactNode;
  isViewer?: boolean;
}

/**
 * A short ranking line (hub panel, weekly friends): position, avatar, name and one value.
 */
const DailyRankingCompactRow = ({
  position,
  userId,
  username,
  avatar,
  supporterBadge,
  value,
  isViewer,
}: Props) => (
  <div
    data-viewer={isViewer || undefined}
    className={cn(
      "flex items-center gap-2.5 rounded-[8px] border border-solid px-2 py-1.5",
      isViewer ? "border-brand-5 bg-nav-accent-subtle" : "border-transparent",
    )}
  >
    <Text
      component={"span"}
      fz={13}
      fw={700}
      className={"w-7 shrink-0 text-subtle"}
    >
      #{position}
    </Text>
    <Link
      href={`/profile/${userId}`}
      className={
        "flex min-w-0 flex-1 items-center gap-2.5 text-inherit no-underline"
      }
    >
      <DailyRankingAvatar
        userId={userId}
        username={username}
        avatar={avatar}
        size={26}
      />
      <DailyRankingName
        username={username}
        supporterBadge={supporterBadge}
        isViewer={isViewer}
        fz={13}
      />
    </Link>
    <Text
      component={"span"}
      fz={13}
      fw={700}
      c="var(--gn-text)"
      className={"shrink-0"}
    >
      {value}
    </Text>
  </div>
);

export { DailyRankingCompactRow };
