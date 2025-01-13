import React from "react";
import { usePlaytimeForUser } from "@/components/playtime/hooks/usePlaytimeForUser";
import { Box, Flex, Group, Overlay, Stack } from "@mantine/core";
import UserPlaytimeItem from "@/components/playtime/UserPlaytimeItem";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { getErrorMessage } from "@/util/getErrorMessage";
import { TBasePaginationRequest } from "@/util/types/pagination";
import useUserId from "@/components/auth/hooks/useUserId";

interface Props extends TBasePaginationRequest {
    userId: string;
}

const UserRecentGames = ({ userId, offset, limit }: Props) => {
    const ownUserId = useUserId();

    const playtime = usePlaytimeForUser({ userId, offset, limit });

    const isEmpty =
        playtime.data != undefined &&
        (playtime.data.data == undefined || playtime.data.data.length === 0);

    const isOwnPlaytime = ownUserId != undefined && ownUserId === userId;

    return (
        <Stack className={"w-full h-full justify-start flex-col"}>
            {playtime.isError && (
                <CenteredErrorMessage
                    message={getErrorMessage(playtime.error)}
                />
            )}
            {isEmpty && !isOwnPlaytime && (
                <CenteredErrorMessage
                    message={"No playtime info available for this user."}
                />
            )}

            {isEmpty && isOwnPlaytime && (
                <CenteredErrorMessage
                    message={"Connect your platforms to import playtime data!"}
                />
            )}

            {playtime.data?.data?.map((item) => (
                <UserPlaytimeItem
                    key={`${item.profileUserId}-${item.id}`}
                    playtime={item}
                />
            ))}
        </Stack>
    );
};

export default UserRecentGames;
