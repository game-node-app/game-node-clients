import React from "react";
import { getConnectionProfileURL, useUserConnections } from "#@/components";
import { Anchor, Group, Image } from "@mantine/core";
import { getServerStoredIcon } from "#@/util";

interface Props {
  userId: string;
}

const ProfileUserInfoConnections = ({ userId }: Props) => {
  const { data, isLoading, isError, error } = useUserConnections(userId);

  if (isError || data == undefined) {
    return null;
  }

  return (
    <Group className={"w-full justify-center items-center"}>
      {data?.map((connection) => {
        return (
          <Anchor
            href={getConnectionProfileURL(connection)}
            target={"_blank"}
            key={`connection-${connection.profileUserId}-${connection.type}`}
          >
            <Image
              alt={"Importer source icon"}
              src={getServerStoredIcon(connection.type.valueOf())}
              w={48}
              h={48}
              className={"mt-6"}
            />
          </Anchor>
        );
      })}
    </Group>
  );
};

export { ProfileUserInfoConnections };
