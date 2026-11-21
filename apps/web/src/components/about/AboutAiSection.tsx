import { Box, Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import Link from "next/link";
import styles from "./AboutFeaturesB.module.css";
import { aboutAsset } from "./aboutAssets";
import {
  AI_ASSISTANTS,
  AI_GAME,
  AI_PERMISSIONS,
} from "./aboutFeaturesBMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

const outlineButtonStyle = {
  backgroundColor: "transparent",
  borderColor: "var(--gn-line-strong)",
  color: "var(--gn-text)",
} as const;

/**
 * GameNode + AI: assistant chips, the /mcp call to action and an illustrative
 * chat with the permission switches the assistant asks for.
 */
const AboutAiSection = () => {
  const { t } = useTranslation();
  const titleId = "about-ai-title";

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.ai}
      className={styles.section}
      aria-labelledby={titleId}
    >
      <Box className={styles.shell}>
        <Box className={styles.aiGrid}>
          <Box className={styles.aiCopy}>
            <AboutSectionHeader
              eyebrow={t("about.ai.eyebrow")}
              title={t("about.ai.title")}
              description={t("about.ai.description")}
              titleId={titleId}
            />
            <Box className={styles.aiChips}>
              {AI_ASSISTANTS.map((assistant) => (
                <span className={styles.assistantChip} key={assistant.id}>
                  {t(assistant.label)}
                </span>
              ))}
            </Box>
            <Button
              component={Link}
              href="/mcp"
              variant="default"
              className={styles.aiCta}
              h={{ base: 50, md: 52 }}
              px={{ base: 20, md: 26 }}
              fz={{ base: 16, md: 17 }}
              fw={700}
              radius={8}
              rightSection={
                <img
                  src={aboutAsset("icon-arrow-right.svg")}
                  width={18}
                  height={18}
                  alt=""
                />
              }
              style={outlineButtonStyle}
            >
              {t("about.ai.cta")}
            </Button>
          </Box>

          {/* Illustrative conversation; the copy beside it already describes it. */}
          <Box className={styles.chatCard} aria-hidden="true">
            <Box className={styles.chatHeader}>
              <img
                className={styles.chatHeaderIcon}
                src={aboutAsset("icon-sparkles-assistant.svg")}
                width={20}
                height={20}
                alt=""
                loading="lazy"
              />
              <span className={styles.chatAssistant}>
                {t("about.ai.chat.assistant")}
              </span>
              <span className={styles.chatConnected}>
                {t("about.ai.chat.connected")}
              </span>
            </Box>

            <Box className={styles.chatBody}>
              <p className={styles.userBubble}>{t("about.ai.chat.prompt")}</p>
              <Box className={styles.assistantReply}>
                <p className={styles.assistantText}>
                  {t("about.ai.chat.reply")}
                </p>
                <Box className={styles.aiGameCard}>
                  <img
                    className={styles.aiGameCover}
                    src={AI_GAME.cover}
                    width={300}
                    height={450}
                    alt=""
                    loading="lazy"
                  />
                  <Box className={styles.aiGameInfo}>
                    <span className={styles.aiGameTitle}>{AI_GAME.title}</span>
                    <span className={styles.aiGameMeta}>
                      {t("about.ai.chat.cardStatus")}
                    </span>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box className={styles.chatFooter}>
              <p className={styles.permissionNote}>
                {t("about.ai.permissions.title")}
              </p>
              {AI_PERMISSIONS.map((permission) => (
                <Box className={styles.permissionRow} key={permission.id}>
                  <span className={styles.permissionLabel}>
                    {t(permission.label)}
                  </span>
                  <span
                    className={[
                      styles.toggle,
                      permission.enabled ? styles.toggleOn : styles.toggleOff,
                    ].join(" ")}
                  >
                    <span
                      className={
                        permission.enabled ? styles.knobOn : styles.knobOff
                      }
                    />
                  </span>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { AboutAiSection };
