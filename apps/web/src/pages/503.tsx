import React from "react";
import { Center, Container, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

const Index = () => {
  const { t } = useTranslation();

  return (
    <Container fluid h={"80vh"}>
      <Stack className={"mt-[50%]"}>
        <Title size={"h4"} className={"text-center"}>
          {t("errors.inDevelopment")}
        </Title>
        <Text className={"text-center"}>{t("errors.comeBackSoon")}</Text>
      </Stack>
    </Container>
  );
};

export default Index;
