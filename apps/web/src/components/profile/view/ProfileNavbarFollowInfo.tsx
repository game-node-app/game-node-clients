import React from "react";
import { FollowInfoRequestDto } from "@/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { useInfiniteFollowInfo } from "@/components/follow/hooks/useInfiniteFollowInfo";
import FollowInfoListModal from "@/components/follow/modal/FollowInfoListModal";
import ProfileViewNavbarLink from "@/components/profile/view/ProfileViewNavbarLink";

interface Props {
    targetUserId: string;
    criteria: FollowInfoRequestDto.criteria;
}

const ProfileNavbarFollowInfo = ({ targetUserId, criteria }: Props) => {
    const [modalOpened, modalUtils] = useDisclosure();
    const followInfoQuery = useInfiniteFollowInfo({
        criteria,
        targetUserId,
    });
    const totalItems =
        followInfoQuery.data?.pages[0]?.pagination.totalItems || 0;

    return (
        <>
            <FollowInfoListModal
                targetUserId={targetUserId}
                criteria={criteria}
                opened={modalOpened}
                onClose={modalUtils.close}
            />
            <ProfileViewNavbarLink
                title={criteria === "followers" ? "Followers" : "Following"}
                href={"#"}
                onClick={(evt) => {
                    evt.preventDefault();
                    modalUtils.open();
                }}
                itemCount={totalItems}
            />
        </>
    );
};

export default ProfileNavbarFollowInfo;
