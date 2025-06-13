import React from "react";
import { Center, CenterProps, Title } from "@mantine/core";
import { getErrorMessage } from "#@/util";

interface Props extends CenterProps {
  message?: string;
  error?: Error;
}

const CenteredErrorMessage = ({ message, error, ...others }: Props) => {
  return (
    <Center className={"w-full h-full"} {...others}>
      <Title c={"red"} size={"h4"} className={"text-center"}>
        {error ? getErrorMessage(error) : message}
      </Title>
    </Center>
  );
};

export { CenteredErrorMessage };
