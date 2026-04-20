import { Spotlight } from "@mantine/spotlight";
import { UserAvatarGroup } from "@repo/ui";

type Props = {
  userId: string;
};

export const CommandCenterUserAction = ({ userId }: Props) => {
  return (
    <Spotlight.Action>
      <UserAvatarGroup userId={userId} />
    </Spotlight.Action>
  );
};
