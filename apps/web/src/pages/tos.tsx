import React from "react";
import {
  Container,
  Flex,
  Paper,
  Stack,
  Title,
  Text,
  List,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";

const Tos = () => {
  const { t } = useTranslation();

  return (
    <Container fluid p={0}>
      <Flex justify={"center"}>
        <Paper
          w={{
            base: "100%",
            lg: "80%",
          }}
          className={"p-4"}
        >
          <Stack w={"100%"}>
            <Title>{t("legal.tos.title")}</Title>
            <Title size={"h4"}>{t("legal.tos.section1Title")}</Title>
            <Text>{t("legal.tos.section1Content")}</Text>
            <Title size={"h4"}>{t("legal.tos.section2Title")}</Title>
            <List type="ordered" listStyleType={"number"} withPadding>
              <List.Item>{t("legal.tos.section2Intro")}</List.Item>
              <List.Item>{t("legal.tos.section2Item1")}</List.Item>
              <List.Item>{t("legal.tos.section2Item2")}</List.Item>
              <List.Item>{t("legal.tos.section2Item3")}</List.Item>
              <List.Item>{t("legal.tos.section2Item4")}</List.Item>
              <List.Item>{t("legal.tos.section2Item5")}</List.Item>
              <List.Item>{t("legal.tos.section2Outro")}</List.Item>
            </List>
            <Title size={"h4"}>{t("legal.tos.section3Title")}</Title>
            <List type="ordered" listStyleType={"number"} withPadding>
              <List.Item>{t("legal.tos.section3Content")}</List.Item>
              <List.Item>{t("legal.tos.section3Content2")}</List.Item>
            </List>
            <Title size={"h4"}>{t("legal.tos.section4Title")}</Title>
            <Text>{t("legal.tos.section4Content")}</Text>
            <Title size={"h4"}>{t("legal.tos.section5Title")}</Title>
            <Text>{t("legal.tos.section5Content")}</Text>
            <Title size={"h4"}>{t("legal.tos.section6Title")}</Title>
            <Text>{t("legal.tos.section6Content")}</Text>
            <Title size={"h4"}>{t("legal.tos.section7Title")}</Title>
            <Text>{t("legal.tos.section7Content")}</Text>
            <Title size={"h4"}>{t("legal.tos.section8Title")}</Title>
            <Text>{t("legal.tos.section8Content")}</Text>
          </Stack>
        </Paper>
      </Flex>
    </Container>
  );
};

export default Tos;
