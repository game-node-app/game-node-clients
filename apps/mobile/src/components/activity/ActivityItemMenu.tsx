import React from "react";
import { Activity, FindOneStatisticsDto } from "@repo/wrapper/server";
import { Menu } from "@mantine/core";
import {
  IconDeviceGamepad,
  IconMessages,
  IconMessageShare,
  IconThumbUp,
  IconUser,
} from "@tabler/icons-react";
import { useUserLike } from "@repo/ui";

interface Props {
  activity: Activity;
  onCommentsClick: () => void;
  onPostClick: () => void;
  onGameClick: () => void;
  onProfileClick: () => void;
}

const ActivityItemMenu = ({
  activity,
  onCommentsClick,
  onPostClick,
  onGameClick,
  onProfileClick,
}: Props) => {
  const [, isLiked, toggleUserLike] = useUserLike({
    sourceId: activity.id,
    sourceType: FindOneStatisticsDto.sourceType.ACTIVITY,
    targetUserId: activity.profileUserId,
  });

  return (
    <>
      {activity.type === "POST" && (
        <Menu.Item
          leftSection={<IconMessageShare color={"white"} size={18} />}
          onClick={onPostClick}
        >
          View Post
        </Menu.Item>
      )}
      <Menu.Item
        leftSection={<IconDeviceGamepad color={"white"} size={18} />}
        onClick={onGameClick}
      >
        Visit Game
      </Menu.Item>
      <Menu.Item
        leftSection={<IconUser color={"white"} size={18} />}
        onClick={onProfileClick}
      >
        Visit User
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={
          <IconThumbUp
            className={isLiked ? "text-brand-4" : "text-white"}
            size={18}
          />
        }
        onClick={toggleUserLike}
      >
        Like
      </Menu.Item>
      <Menu.Item
        onClick={onCommentsClick}
        leftSection={<IconMessages color={"white"} size={18} />}
      >
        Comment
      </Menu.Item>
    </>
  );
};

export { ActivityItemMenu };
