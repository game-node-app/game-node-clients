import { GameNodeLogo } from "#@/components/general/GameNodeLogo";
import { UserAvatarGroup } from "#@/components/general/avatar/UserAvatarGroup";
import { Box, Text } from "@mantine/core";

interface Props {
  userId: string;
  periodText: string;
}

/** Avatar and name, period label and logo, in native card pixels. */
export function RecapCardFooter({ userId, periodText }: Props) {
  return (
    <Box className={"flex items-center justify-between w-full"}>
      <UserAvatarGroup
        userId={userId}
        avatarProps={{ size: 72 }}
        groupProps={{ wrap: "nowrap", gap: 20 }}
        textProps={{ lineClamp: 1, style: { fontSize: 36 } }}
      />
      <Text style={{ fontSize: 32 }} c={"dimmed"}>
        {periodText}
      </Text>
      <GameNodeLogo style={{ width: 150 }} />
    </Box>
  );
}
