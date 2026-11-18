import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { LandingHeader } from "@/components/general/header/LandingHeader";
import { useEffect } from "react";
import { useUserId } from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import Link from "next/link";
import styles from "@/components/landing/Landing.module.css";
import { PopularSection } from "@/components/landing/PopularSection";
import { SupporterSection } from "@/components/landing/SupporterSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { OpenGraph } from "@/components/general/OpenGraph";
import { SITE_URL } from "@/util/seo";

const asset = (file: string) => `/img/landing/${file}`;
const Home = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const router = useRouter();
  useEffect(() => {
    if (userId) router.push("/home");
  }, [router, userId]);

  return (
    <Box className={styles.page}>
      <OpenGraph
        title={`GameNode - ${t("landing.presentation.heroTitle")}`}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "GameNode",
            url: SITE_URL,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "GameNode",
            url: SITE_URL,
            logo: `${SITE_URL}/favicon/apple-touch-icon.png`,
          },
        ]}
      />
      <Box className={styles.hero}>
        <img
          className={styles.heroBackground}
          src={asset("hero-background.png")}
          width={1440}
          height={1080}
          alt=""
        />
        <LandingHeader />
        <Container size={1302} pt={76}>
          <Title order={1} className={styles.headline}>
            {t("landing.presentation.heroTitle")}
          </Title>
          <Text size="xl" fw={700} maw={527} mt={30}>
            {t("landing.presentation.heroDescription")}
          </Text>
          <Button component={Link} href="/home" size="lg" radius={8} mt={36}>
            {t("landing.presentation.start")}
          </Button>
          <Box className={styles.mockups}>
            <Box className={styles.desktop}>
              <img
                src={asset("1191c.png")}
                alt={t("landing.presentation.desktopAlt")}
                fetchPriority="high"
              />
            </Box>
            <Box className={styles.mobile}>
              <img
                src={asset("d8e1b.png")}
                alt={t("landing.presentation.mobileAlt")}
              />
            </Box>
          </Box>
        </Container>
      </Box>
      <Box component="main">
        <Container
          component="section"
          id="features"
          size={1302}
          className={styles.section}
        >
          <Text className={styles.eyebrow}>
            {t("landing.presentation.featuresLabel")}
          </Text>
          <Title order={2} mt={14}>
            {t("landing.presentation.featuresTitle")}
          </Title>
          <Text c="dimmed" size="lg" mt={14} mb={40}>
            {t("landing.presentation.featuresDescription")}
          </Text>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing={16}>
            <Paper className={styles.card}>
              <Group
                className={styles.visual}
                gap={10}
                justify="center"
                wrap="nowrap"
              >
                <img
                  src={asset("1a760.png")}
                  width={96}
                  height={130}
                  alt=""
                  loading="lazy"
                />
                <img
                  src={asset("7ad0c.png")}
                  width={96}
                  height={156}
                  alt=""
                  loading="lazy"
                />
                <img
                  src={asset("880d7.png")}
                  width={96}
                  height={130}
                  alt=""
                  loading="lazy"
                />
              </Group>
              <Title order={3}>{t("landing.presentation.libraryTitle")}</Title>
              <Text>{t("landing.presentation.libraryDescription")}</Text>
            </Paper>
            <Paper className={styles.card}>
              <Stack
                className={styles.visual}
                gap={4}
                align="center"
                justify="center"
              >
                <Text fz={64} fw={700} lh={1.4}>
                  4.8
                </Text>
                <img src={asset("86dc6.svg")} alt="" loading="lazy" />
              </Stack>
              <Title order={3}>{t("landing.presentation.reviewsTitle")}</Title>
              <Text>{t("landing.presentation.reviewsDescription")}</Text>
            </Paper>
            <Paper className={styles.card}>
              <Box className={styles.visual}>
                <img src={asset("4cfd8.svg")} alt="" loading="lazy" />
              </Box>
              <Title order={3}>
                {t("landing.presentation.discoveryTitle")}
              </Title>
              <Text>{t("landing.presentation.discoveryDescription")}</Text>
            </Paper>
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, md: 2 }} mt={16} spacing={16}>
            <Paper className={`${styles.card} ${styles.wideCard}`}>
              <Stack gap={18}>
                <img
                  src={asset("817f3.svg")}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                />
                <Title order={3}>
                  {t("landing.presentation.progressTitle")}
                </Title>
                <Text>{t("landing.presentation.progressDescription")}</Text>
              </Stack>
              <Paper withBorder p={16} radius={8} bg="transparent">
                <Text fz={11} c="dimmed">
                  {t("landing.presentation.activity")}
                </Text>
                <Text fz={25} fw={600} my={20}>
                  {t("landing.presentation.hours")}
                </Text>
                <img src={asset("411fa.svg")} alt="" loading="lazy" />
              </Paper>
            </Paper>
            <Paper className={`${styles.card} ${styles.wideCard}`}>
              <Stack gap={18}>
                <img
                  src={asset("5684b.svg")}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                />
                <Title order={3}>
                  {t("landing.presentation.communityTitle")}
                </Title>
                <Text>{t("landing.presentation.communityDescription")}</Text>
              </Stack>
              <Stack gap={14}>
                {[
                  ["ThePrado", "d30bb.png"],
                  ["Lamarcke", "64711.png"],
                  ["Kiss", "d30bb.png"],
                ].map(([name, file]) => (
                  <Group key={name} wrap="nowrap">
                    <img
                      src={asset(file!)}
                      width={42}
                      height={42}
                      alt=""
                      loading="lazy"
                    />
                    <Text size="sm" fw={600}>
                      {name}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </SimpleGrid>
        </Container>
        <PopularSection />
        <Container
          component="section"
          size={1302}
          className={styles.connections}
        >
          <Text className={styles.eyebrow}>
            {t("landing.presentation.connectionsLabel")}
          </Text>
          <Title order={2} mt={16}>
            {t("landing.presentation.connectionsTitle")}
          </Title>
          <Text c="dimmed" size="lg" mt={16}>
            {t("landing.presentation.connectionsDescription")}
          </Text>
          <Box className={styles.diagram}>
            <img
              className={styles.curves}
              src={asset("e3516.svg")}
              alt=""
              loading="lazy"
            />
            <Box className={styles.hub}>
              <img
                src={asset("41a07.svg")}
                width={85}
                height={36}
                alt="GameNode"
                loading="lazy"
              />
            </Box>
            {[
              ["Steam", "780e4.svg"],
              ["Xbox", "24331.svg"],
              ["PlayStation", "1255f.svg"],
              ["Epic Games", "317b0.svg"],
              ["GOG", "b5a83.svg"],
              ["Ubisoft", "7fdb2.svg"],
            ].map(([name, file], i) => (
              <Box
                className={styles.platform}
                key={name}
                style={{
                  left: i < 3 ? "10%" : "82.73%",
                  top: `${5.26 + (i % 3) * 34.21}%`,
                }}
              >
                <Box className={styles.platformIcon}>
                  <img src={asset(file!)} alt="" loading="lazy" />
                </Box>
                <Text size="sm" mt={9}>
                  {name}
                </Text>
              </Box>
            ))}
          </Box>
        </Container>
        <Container
          component="section"
          id="ai"
          size={1302}
          className={styles.section}
        >
          <Paper className={styles.ai}>
            <Stack gap={20} align="flex-start">
              <Text className={styles.eyebrow}>
                {t("landing.presentation.aiLabel")}
              </Text>
              <Title order={2}>{t("landing.presentation.aiTitle")}</Title>
              <Text c="dimmed" size="lg">
                {t("landing.presentation.aiDescription")}
              </Text>
              <Group gap={8}>
                {["Claude", "ChatGPT", "Codex", "Claude Code"].map((name) => (
                  <Badge key={name} variant="default" radius="sm" size="lg">
                    {name}
                  </Badge>
                ))}
              </Group>
              <Button component={Link} href="/mcp" size="lg" radius={8}>
                {t("landing.presentation.aiCta")}
              </Button>
            </Stack>
            {/* Illustrative conversation, hidden from assistive tech since the copy beside it says the same. */}
            <Stack className={styles.chat} gap={14} aria-hidden>
              <Text className={styles.userBubble}>
                {t("landing.presentation.aiPrompt")}
              </Text>
              <Group gap={8} className={styles.tool} wrap="nowrap">
                <img src={asset("41a07.svg")} width={38} height={16} alt="" />
                <Text size="xs" ff="monospace" c="dimmed">
                  search_games · add_game_to_library
                </Text>
              </Group>
              <Text className={styles.assistantBubble}>
                {t("landing.presentation.aiReply")}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {t("landing.presentation.aiPermission")}
              </Text>
            </Stack>
          </Paper>
        </Container>
        <SupporterSection />
      </Box>
      <LandingFooter />
    </Box>
  );
};
export default Home;
