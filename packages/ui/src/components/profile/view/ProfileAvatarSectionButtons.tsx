import React from "react";
import {
  ItemDropdown,
  ReportCreateFormModal,
  UserFollowActions,
  useUserId,
} from "#@/components";
import { Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CreateReportRequestDto } from "@repo/wrapper/server";
import sourceType = CreateReportRequestDto.sourceType;

interface Props {
  userId: string;
  onEditClick: () => void;
}

const ProfileAvatarSectionButtons = ({ userId, onEditClick }: Props) => {
  const ownUserId = useUserId();
  const isOwnProfile = ownUserId === userId;
  const [reportModalOpened, reportModalUtils] = useDisclosure();

  return (
    <Group className={"w-52 max-w-fit flex-nowrap gap-4"}>
      <ReportCreateFormModal
        opened={reportModalOpened}
        onClose={reportModalUtils.close}
        sourceId={userId}
        sourceType={sourceType.PROFILE}
      />
      {!isOwnProfile && (
        <ItemDropdown>
          <ItemDropdown.ReportButton onClick={reportModalUtils.open} />
        </ItemDropdown>
      )}
      {isOwnProfile ? (
        <Button variant={"default"} size={"sm"} onClick={onEditClick}>
          Edit Profile
        </Button>
      ) : (
        <UserFollowActions targetUserId={userId} />
      )}
    </Group>
  );
};

export { ProfileAvatarSectionButtons };
