import React from "react";
import { Button, Center, Stack, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

const LoginPromptCentered = () => {
  const { t } = useTranslation();

  return (
    <Center>
      <Stack>
        <Title size={"h4"}>{t("auth.loginRequired")}</Title>
        <Button>{t("actions.login")}</Button>
      </Stack>
    </Center>
  );
};

export { LoginPromptCentered };
