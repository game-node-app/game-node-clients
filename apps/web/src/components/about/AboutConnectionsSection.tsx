import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import styles from "./AboutFeaturesB.module.css";
import { CONNECTION_HUB, CONNECTION_PLATFORMS } from "./aboutFeaturesBMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

/**
 * How the library is imported: six platform cards, the connector and the
 * GameNode hub with the data it keeps in sync.
 */
const AboutConnectionsSection = () => {
  const { t } = useTranslation();
  const titleId = "about-connections-title";

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.connections}
      className={styles.section}
      aria-labelledby={titleId}
    >
      <Box className={styles.shell}>
        <Box className={styles.connectionsIntro}>
          <AboutSectionHeader
            align="center"
            eyebrow={t("about.connections.eyebrow")}
            title={t("about.connections.title")}
            description={t("about.connections.description")}
            titleId={titleId}
            className={styles.connectionsHeader}
          />
        </Box>

        <Box className={styles.platformGrid}>
          {CONNECTION_PLATFORMS.map((platform) => (
            <Box className={styles.platformCard} key={platform.id}>
              <span className={styles.platformIcon}>
                <img
                  src={platform.icon}
                  width={28}
                  height={28}
                  alt=""
                  loading="lazy"
                />
              </span>
              <p className={styles.platformName}>{t(platform.label)}</p>
            </Box>
          ))}
        </Box>

        {/* The U-shaped line and the stem only connect the cards to the hub. */}
        <Box className={styles.connector} aria-hidden="true">
          <span className={styles.connectorArc} />
          <span className={styles.connectorStem} />
        </Box>

        <Box className={styles.hub}>
          <img
            className={styles.hubLogo}
            src={CONNECTION_HUB.logo}
            width={85}
            height={36}
            alt="GameNode"
            loading="lazy"
          />
          <Box className={styles.hubChips}>
            {CONNECTION_HUB.chips.map((chip) => (
              <span className={styles.chip} key={chip.id}>
                {t(chip.label)}
              </span>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { AboutConnectionsSection };
