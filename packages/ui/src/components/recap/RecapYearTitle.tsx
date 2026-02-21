import React from "react";
import { CopyButton, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import classes from "./RecapYearTitle.module.css";
import { UserAvatarGroup, useUserId } from "#@/components";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

interface Props {
  userId: string;
  targetYear: number;
  withShareButton?: boolean;
}

const RecapYearTitle = ({
  userId,
  targetYear,
  withShareButton = false,
}: Props) => {
  const ownUserId = useUserId();
  const isOwnRecap = ownUserId === userId;
  const { copy } = useClipboard();

  return (
    <Stack className={"gap-3"}>
      <Group
        className={`gap-0 ${classes.recapYearTitle} w-full justify-center lg:w-fit`}
      >
        <Text span className={`text-6xl text-brand`}>
          {targetYear}
        </Text>
        <Text span className={"text-6xl"}>
          RECAP
        </Text>
      </Group>
      <Group className={"justify-between"}>
        <UserAvatarGroup userId={userId} />
        {withShareButton && (
          <UnstyledButton
            onClick={() => {
              const url = `${window.location.origin}/users/${userId}/recap/${targetYear}`;
              copy(url);
              notifications.show({
                color: "green",
                title: "Link copied to clipboard",
                message: isOwnRecap
                  ? "Share your recap with your friends!"
                  : "Share this recap with your friends!",
                autoClose: 5000,
              });
            }}
          >
            <Text>Share</Text>
          </UnstyledButton>
        )}
      </Group>
    </Stack>
  );
};

export { RecapYearTitle };
