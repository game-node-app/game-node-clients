import React from "react";
import {
  Anchor,
  Button,
  Code,
  Collapse,
  Notification,
  Stack,
  Text,
} from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

interface Props {
  error: Error;
}

const ErrorBoundaryFallback = ({ error }: Props) => {
  const [detailsOpen, detailsOpenUtils] = useDisclosure();
  const { copy } = useClipboard({});
  return (
    <Stack className={"w-full items-center"}>
      <Notification
        withCloseButton={false}
        withBorder
        color="red"
        title="An unexpected error has occurred while loading this page"
      >
        {error.message}
      </Notification>
      <Button
        onClick={() => {
          detailsOpenUtils.open();
          copy(error.stack);
          notifications.show({
            title: "Error details copied to clipboard",
            message:
              "You may now paste the error details when reporting the issue.",
          });
        }}
        variant={"outline"}
      >
        Show details
      </Button>
      <Collapse in={detailsOpen}>
        <Code>{error.stack}</Code>
      </Collapse>
      <Text className={"leading-6 mt-4 text-center text-sm text-dimmed"}>
        Please let us know about this error by sending us a message via{" "}
        <Anchor href={"mailto:support@gamenode.app"}>email</Anchor> or{" "}
        <Anchor href={"https://discord.gg/tqFpWT3C5N"}>Discord</Anchor>.
      </Text>
    </Stack>
  );
};

export { ErrorBoundaryFallback };
