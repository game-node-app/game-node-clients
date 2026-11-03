import { getConnectionProfileURL, useUserConnections } from "#@/components";
import { cn, getServerStoredIcon } from "#@/util";
import {
  Anchor,
  AnchorProps,
  Group,
  GroupProps,
  Image,
  ImageProps,
} from "@mantine/core";

interface Props extends GroupProps {
  userId: string;
  imageProps?: ImageProps;
  anchorProps?: AnchorProps;
}

const ProfileUserInfoConnections = ({
  userId,
  anchorProps,
  imageProps,
  ...others
}: Props) => {
  const { data, isError } = useUserConnections(userId);

  if (isError || data == undefined) {
    return null;
  }

  return (
    <Group
      className={cn(
        "w-full justify-center items-center mobile:justify-start",
        others.className,
      )}
      {...others}
    >
      {data?.map((connection) => {
        const href = getConnectionProfileURL(connection);
        const icon = (
          <Image
            alt={"Importer source icon"}
            src={getServerStoredIcon(connection.type.valueOf())}
            w={40}
            h={40}
            {...imageProps}
          />
        );
        if (!href) {
          return (
            <span
              key={`connection-${connection.profileUserId}-${connection.type}`}
            >
              {icon}
            </span>
          );
        }
        return (
          <Anchor
            href={href}
            target={"_blank"}
            key={`connection-${connection.profileUserId}-${connection.type}`}
            {...anchorProps}
          >
            {icon}
          </Anchor>
        );
      })}
    </Group>
  );
};

export { ProfileUserInfoConnections };
