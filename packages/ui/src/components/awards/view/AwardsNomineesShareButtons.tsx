import React from "react";
import { useAwardEvent, useUserId } from "#@/components";
import {
  Button,
  CopyButton,
  Divider,
  Group,
  GroupProps,
  Stack,
  StackProps,
  Text,
} from "@mantine/core";
import { cn } from "#@/util";
import { AwardsNomineesShareModal } from "#@/components/awards/share/AwardsNomineesShareModal.tsx";
import { useDisclosure } from "@mantine/hooks";

interface Props extends StackProps {
  userId: string;
  eventId: number;
  onShare: (file: File) => Promise<void>;
}

const AwardsNomineesShareButtons = ({
  userId,
  eventId,
  onShare,
  ...others
}: Props) => {
  const host = window.location.host.includes("localhost")
    ? window.location.host
    : "gamenode.app";
  const ownUserId = useUserId();
  const { data: event } = useAwardEvent({ eventId });

  const [imageModalOpened, imageModalUtils] = useDisclosure();

  const isOwn = ownUserId != undefined && ownUserId === userId;

  if (!isOwn || !event) {
    return null;
  }

  return (
    <Stack {...others} className={cn("gap-5 items-center", others.className)}>
      <AwardsNomineesShareModal
        eventId={eventId}
        opened={imageModalOpened}
        onClose={imageModalUtils.close}
        onShare={onShare}
      />
      <Text className={"text-dimmed text-sm"}>Share your votes!</Text>
      <Group className={"w-full justify-center gap-6 flex-wrap"}>
        <CopyButton
          value={`https://${host}/awards/${event.year}/nominees/${userId}`}
        >
          {({ copied, copy }) => (
            <Button
              size={"lg"}
              variant={"light"}
              color={copied ? "teal" : "teal.5"}
              onClick={copy}
              className={"w-52"}
            >
              {copied ? "Link Copied!" : "Share with Link"}
            </Button>
          )}
        </CopyButton>
        <Button
          size={"lg"}
          color={"blue"}
          onClick={imageModalUtils.open}
          className={"w-52"}
        >
          Share with Image
        </Button>
      </Group>
    </Stack>
  );
};

export { AwardsNomineesShareButtons };
