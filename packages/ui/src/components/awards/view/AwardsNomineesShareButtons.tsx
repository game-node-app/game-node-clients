import React from "react";
import { useAwardEvent, useUserId } from "#@/components";
import {
  Button,
  CopyButton,
  Group,
  Stack,
  StackProps,
  Text,
} from "@mantine/core";
import { cn } from "#@/util";
import { AwardsNomineesShareModal } from "#@/components/awards/share/AwardsNomineesShareModal.tsx";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";

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
  const { t } = useTranslation();
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
      <Text className={"text-dimmed text-sm"}>{t("awards.share.title")}</Text>
      <Group className={"w-full justify-center gap-6 flex-wrap"}>
        <CopyButton
          value={`https://gamenode.app/awards/${event.year}/nominees/${userId}`}
        >
          {({ copied, copy }) => (
            <Button
              size={"lg"}
              variant={"light"}
              color={copied ? "teal" : "teal.5"}
              onClick={copy}
              className={"w-52"}
            >
              {copied
                ? t("awards.share.linkCopied")
                : t("awards.share.shareWithLink")}
            </Button>
          )}
        </CopyButton>
        <Button
          size={"lg"}
          color={"blue"}
          onClick={imageModalUtils.open}
          className={"w-52"}
        >
          {t("awards.share.shareWithImage")}
        </Button>
      </Group>
    </Stack>
  );
};

export { AwardsNomineesShareButtons };
