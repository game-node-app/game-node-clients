import React from "react";
import { Modal, ScrollArea } from "@mantine/core";
import { BaseModalProps } from "@/util/types/modal-props";
import FollowInfoList from "@/components/follow/list/FollowInfoList";
import { FollowInfoRequestDto } from "@/wrapper/server";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import CenteredLoading from "@/components/general/CenteredLoading";

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
    const title = criteria === "followers" ? `Followers` : `Following`;
    return (
        <Modal opened={opened} onClose={onClose} title={title}>
            <Modal.Body p={0}>
                <ScrollArea h={400}>
                    <FollowInfoList
                        criteria={criteria}
                        targetUserId={targetUserId}
                    />
                </ScrollArea>
            </Modal.Body>
        </Modal>
    );
};

export default FollowInfoListModal;
