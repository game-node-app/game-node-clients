import { Box, Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import styles from "./AboutFeaturesB.module.css";
import { aboutAsset } from "./aboutAssets";
import { GOOGLE_PLAY_URL } from "./aboutFeaturesBMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

const storeButtonStyle = {
  backgroundColor: "transparent",
  borderColor: "#3a3a3a",
  color: "#fafafa",
} as const;

/**
 * Mobile app section: the phone mockup with its glow, the Google Play link and
 * the disabled App Store button.
 */
const AboutMobileAppSection = () => {
  const { t } = useTranslation();
  const titleId = "about-mobile-app-title";

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.mobileApp}
      className={styles.section}
      aria-labelledby={titleId}
    >
      <Box className={styles.shell}>
        <Box className={styles.mobileGrid}>
          <Box className={styles.mobileVisual} aria-hidden="true">
            <img
              className={styles.mobileVisualImage}
              src={aboutAsset("app-phones.png")}
              width={695}
              height={366}
              alt=""
              loading="lazy"
            />
            <span className={styles.mobileVisualFade} />
          </Box>

          <Box className={styles.mobileCopy}>
            <AboutSectionHeader
              eyebrow={t("about.mobileApp.eyebrow")}
              title={t("about.mobileApp.title")}
              description={t("about.mobileApp.description")}
              titleId={titleId}
            />

            <Box className={styles.storeButtons}>
              <Button
                component="a"
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noreferrer noopener"
                variant="default"
                h={{ base: 50, md: 56 }}
                px={{ base: 20, md: 26 }}
                fz={{ base: 16, md: 17 }}
                fw={700}
                radius={8}
                w={{ base: "100%", lg: "auto" }}
                leftSection={
                  <img
                    src={aboutAsset("icon-google-play.svg")}
                    width={18}
                    height={18}
                    alt=""
                  />
                }
                style={storeButtonStyle}
              >
                {t("about.mobileApp.googlePlay")}
              </Button>

              <Button
                component="button"
                type="button"
                disabled
                variant="default"
                h={{ base: 50, md: 56 }}
                px={{ base: 20, md: 26 }}
                fz={{ base: 16, md: 17 }}
                fw={700}
                radius={8}
                w={{ base: "100%", lg: "auto" }}
                leftSection={
                  <img
                    src={aboutAsset("icon-apple.svg")}
                    width={18}
                    height={18}
                    alt=""
                  />
                }
                style={{ ...storeButtonStyle, opacity: 0.6 }}
              >
                {t("about.mobileApp.appStore")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { AboutMobileAppSection };
