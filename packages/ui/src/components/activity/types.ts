import { Activity, ActivityResponseDto } from "@repo/wrapper/server";

export type ActivityItemData = Activity &
  Partial<Pick<ActivityResponseDto, "game" | "statistics">>;

export interface ActivityItemProps {
  activity: ActivityItemData;
  withUserAvatar?: boolean;
  variant?: "card" | "default";
}
