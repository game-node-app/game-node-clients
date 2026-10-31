import { Link } from "#@/util";
import { Divider, Text } from "@mantine/core";
import { ComponentPropsWithoutRef } from "react";

interface Props extends ComponentPropsWithoutRef<typeof Link> {
  title: string;
  itemCount?: number;
  showItemCount?: boolean;
}

const ProfileViewNavbarLink = ({
  title,
  itemCount = 0,
  showItemCount = true,
  ...linkProps
}: Props) => {
  return (
    <Link
      className={"w-full h-full flex flex-col items-center gap-1.5"}
      {...linkProps}
    >
      <Text className={"text-lg lg:text-xl text-center"}>{title}</Text>
      {showItemCount && (
        <>
          <Divider className={"w-full"} />
          <Text className={"text-sm text-dimmed"}>{itemCount}</Text>
        </>
      )}
    </Link>
  );
};

export { ProfileViewNavbarLink };