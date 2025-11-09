import React, { useMemo } from "react";
import { UserConnectionDto } from "@repo/wrapper/server";
import { Button, Image, Stack, Title } from "@mantine/core";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { Link } from "#@/util";
import { getConnectionName } from "#@/components";

interface Props {
  connection: UserConnectionDto;
}

const ImporterPlatform = ({ connection }: Props) => {
  const connectionName = useMemo(
    () => getConnectionName(connection.type),
    [connection.type],
  );
  return (
    <Stack className={"h-56 w-56 items-center bg-[#141414]"}>
      <Image
        alt={"Importer source icon"}
        src={getServerStoredIcon(connection.type.valueOf())}
        w={48}
        h={48}
        className={"mt-6"}
      />
      <Title size={"h4"}>{connectionName}</Title>
      <Link
        href={`/importer/${connection.type.valueOf()}`}
        className={"w-9/12 mt-auto mb-4"}
      >
        <Button className={"w-full "}>Import</Button>
      </Link>
    </Stack>
  );
};

export { ImporterPlatform };
