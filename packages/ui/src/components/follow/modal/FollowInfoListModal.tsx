import { FollowInfoList } from "#@/components/follow/list/FollowInfoList";
import { Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { ScrollArea } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";

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