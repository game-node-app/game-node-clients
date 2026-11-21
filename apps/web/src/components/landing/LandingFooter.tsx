import {
  Anchor,
  Box,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import Link from "next/link";
import styles from "@/components/landing/Landing.module.css";

const asset = (file: string) => `/img/landing/${file}`;

const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <Box component="footer" className={styles.footer}>
      <img
        className={styles.wordmark}
        src={asset("wordmark.svg")}
        width={1266}
        height={125}
        alt=""
        loading="lazy"
      />
      <Box className={styles.footerPanel}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60}>
          <Stack gap={30}>
            <Title order={2} fz={25} maw={390}>
              {t("landing.presentation.footerTitle")}
            </Title>
            <Group mt={40}>
              <Anchor href="https://x.com/gamenodeapp">X</Anchor>
              <Anchor href="https://discord.gg/kcAT562B5A">DISCORD</Anchor>
            </Group>
            <Text size="xs">{t("landing.presentation.copyright")}</Text>
          </Stack>
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={24}>
            <Stack>
              <Text fw={600}>{t("landing.presentation.product")}</Text>
              <Anchor href="#features">
                {t("landing.presentation.features")}
              </Anchor>
              <Anchor component={Link} href="/premium">
                {t("landing.presentation.premium")}
              </Anchor>
              <Anchor component={Link} href="/mcp">
                {t("navigation.ai")}
              </Anchor>
              <Anchor href="https://play.google.com/store/apps/details?id=app.gamenode">
                {t("landing.presentation.downloads")}
              </Anchor>
              <Anchor component={Link} href="/blog">
                {t("landing.presentation.blog")}
              </Anchor>
              <Anchor href="https://discord.gg/kcAT562B5A">
                {t("landing.presentation.help")}
              </Anchor>
            </Stack>
            <Stack>
              <Text fw={600}>GameNode</Text>
              <Anchor component={Link} href="/about">
                {t("landing.presentation.about")}
              </Anchor>
              <Anchor href="https://discord.gg/kcAT562B5A">
                {t("landing.presentation.community")}
              </Anchor>
              <Anchor href="mailto:support@gamenode.app">
                {t("landing.presentation.contact")}
              </Anchor>
              <Anchor component={Link} href="/tos">
                {t("navigation.terms")}
              </Anchor>
              <Anchor component={Link} href="/privacy">
                {t("landing.presentation.privacy")}
              </Anchor>
            </Stack>
            <Stack>
              <Text fw={600}>{t("landing.presentation.social")}</Text>
              <Anchor href="https://x.com/gamenodeapp">X / Twitter</Anchor>
              <Anchor href="https://discord.gg/kcAT562B5A">Discord</Anchor>
              <Anchor href="https://github.com/game-node-app">GitHub</Anchor>
            </Stack>
          </SimpleGrid>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export { LandingFooter };
