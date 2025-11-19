import React from "react";
import {
  AwardsEventLogo,
  CenteredLoading,
  useAwardEvent,
  UserAvatarGroup,
} from "#@/components";
import { Box, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "#@/util";

interface Props {
  eventId: number;
  userId: string;
}

const AwardsNomineesOverview = ({ eventId, userId }: Props) => {
  const { isLoading } = useAwardEvent({ eventId });

  if (isLoading) {
    return <CenteredLoading />;
  }

  return (
    <Stack align={"center"}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "30%",
          backgroundImage: `url('/img/awards_event_bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
          opacity: 1,
        }}
      />
      <div className={"mt-8 lg:mt-40"}>
        <AwardsEventLogo
          logoProps={{
            className: "h-12 lg:h-16",
          }}
          titleProps={{
            className: "text-4xl lg:text-5xl",
          }}
        />
      </div>
      <Group>
        <Text>Indicated by</Text>
        <Box className={"max-w-96"}>
          <UserAvatarGroup
            userId={userId}
            groupProps={{
              gap: "sm",
            }}
          />
        </Box>
      </Group>
    </Stack>
  );
};

export { AwardsNomineesOverview };
