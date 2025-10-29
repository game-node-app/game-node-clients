import { Activity } from "@repo/wrapper/server";

export interface ActivityItemProps {
  activity: Activity;
  withUserAvatar?: boolean;
  variant?: "card" | "default";
}
