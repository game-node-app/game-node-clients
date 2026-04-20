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
import { useTranslation } from "@repo/locales";

interface Props {
  error: Error;
}

const ErrorBoundaryFallback = ({ error }: Props) => {
  const { t } = useTranslation();
  const [detailsOpen, detailsOpenUtils] = useDisclosure();
  const { copy } = useClipboard({});
  return (
    <Stack className={"w-full items-center"}>
      <Notification
        withCloseButton={false}
        withBorder
        color="red"
        title={t("errors.unexpected")}
      >
        {error.message}
      </Notification>
      <Button
        onClick={() => {
          detailsOpenUtils.open();
          copy(error.stack);
          notifications.show({
            title: t("errors.copiedToClipboard"),
            message: t("errors.pasteInstructions"),
          });
        }}
        variant={"outline"}
      >
        {t("errors.showDetails")}
      </Button>
      <Collapse expanded={detailsOpen}>
        <Code>{error.stack}</Code>
      </Collapse>
      <Text className={"leading-6 mt-4 text-center text-sm text-dimmed"}>
        {t("errors.reportPrompt")}{" "}
        <Anchor href={"mailto:support@gamenode.app"}>
          {t("errors.email")}
        </Anchor>{" "}
        {t("common.or")}{" "}
        <Anchor href={"https://discord.gg/tqFpWT3C5N"}>
          {t("errors.discord")}
        </Anchor>
        .
      </Text>
    </Stack>
  );
};

export { ErrorBoundaryFallback };
