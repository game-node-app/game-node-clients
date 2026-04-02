import React from "react";
import {
  Box,
  Container,
  Flex,
  Image,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";

const Privacy = () => {
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
            <Title size={"h1"}>{t("legal.privacy.title")}</Title>
            <Text>{t("legal.privacy.intro")}</Text>
            <Title size={"h2"}>{t("legal.privacy.contactTitle")}</Title>
            <Text>{t("legal.privacy.contactText")}</Text>
            <a href={"mailto:support@gamenode.app"}>
              {t("legal.privacy.contactEmail")}
            </a>
            <Title>{t("legal.privacy.cookieTitle")}</Title>
            <Text>{t("legal.privacy.cookieIntro")}</Text>
            <Title size={"h4"}>{t("legal.privacy.whatAreCookiesTitle")}</Title>
            <Text>{t("legal.privacy.whatAreCookiesContent")}</Text>
            <Title size={"h4"}>{t("legal.privacy.howWeUseTitle")}</Title>
            <Text>{t("legal.privacy.howWeUseContent")}</Text>
            <Title size={"h4"}>{t("legal.privacy.disablingTitle")}</Title>
            <Text>{t("legal.privacy.disablingContent")}</Text>
            <Title size={"h4"}>{t("legal.privacy.thirdPartyTitle")}</Title>
            <Text>{t("legal.privacy.thirdPartyContent")}</Text>
            <Text>
              {t("legal.privacy.cloudflareIntro")}{" "}
              <a href={"https://cloudflare.com"}>
                {t("legal.privacy.cloudflare")}
              </a>
              . {t("legal.privacy.cloudflareContent")}
            </Text>
            <Text>
              {t("legal.privacy.cloudflarePrivacy")}{" "}
              <a href={"https://www.cloudflare.com/privacypolicy/"}>
                {t("legal.privacy.here")}
              </a>
              .
            </Text>
            <Title size={"h4"}>{t("legal.privacy.cookiesWeSetTitle")}</Title>
            <Text>
              {t("legal.privacy.weUse")}{" "}
              <a target={"_blank"} href={"https://posthog.com/privacy"}>
                {t("legal.privacy.posthog")}
              </a>
              {t("legal.privacy.posthogContent")}
            </Text>
            <Text>
              {t("legal.privacy.posthogPrivacy")}{" "}
              <a href={"https://posthog.com/privacy"}>
                {t("legal.privacy.here")}
              </a>
              .
            </Text>
            <Text>{t("legal.privacy.matomoNote")}</Text>
            <Title>{t("legal.privacy.consentTitle")}</Title>
            <Text>{t("legal.privacy.consentContent")}</Text>
            <Text>{t("legal.privacy.dataRemoval")}</Text>
          </Stack>
        </Paper>
      </Flex>
    </Container>
  );
};

export default Privacy;
