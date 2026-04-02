import React from "react";
import { ScrollArea } from "@mantine/core";
import { BaseModalProps } from "#@/util/types/modal-props";
import { FollowInfoList } from "#@/components/follow/list/FollowInfoList";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import { Modal } from "#@/util";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalProps {
  targetUserId: string;
  criteria: FollowInfoRequestDto.criteria;
}

const FollowInfoListModal = ({
  opened,
  onClose,
  targetUserId,
  criteria,
}: Props) => {
  const { t } = useTranslation();
  const title =
    criteria === "followers"
      ? t("follow.titles.followers")
      : t("follow.titles.following");
  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <ScrollArea h={400}>
        <FollowInfoList criteria={criteria} targetUserId={targetUserId} />
      </ScrollArea>
    </Modal>
  );
};

export { FollowInfoListModal };
