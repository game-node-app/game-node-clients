import { Box, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { ABOUT_MANIFESTO_ITEMS } from "./aboutTopMockData";
import { AboutSectionHeader } from "./common/AboutSectionHeader";
import styles from "./AboutTop.module.css";

const AboutManifesto = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      className={styles.manifesto}
      aria-labelledby="about-manifesto-title"
    >
      <div className={styles.container}>
        <AboutSectionHeader
          className={styles.manifestoHeader}
          eyebrow={t("about.manifesto.eyebrow")}
          title={
            <>
              {/* Two tones come from separate keys; keep the sentence gap. */}
              <span>{t("about.manifesto.textStart")}</span>{" "}
              <span className={styles.manifestoMuted}>
                {t("about.manifesto.textMuted")}
              </span>
            </>
          }
          titleId="about-manifesto-title"
        />

        <div className={styles.manifestoGrid}>
          {ABOUT_MANIFESTO_ITEMS.map((item) => (
            <div className={styles.manifestoItem} key={item.id}>
              <div className={styles.manifestoItemHeading}>
                <img
                  src={item.icon}
                  width={22}
                  height={22}
                  alt=""
                  loading="lazy"
                />
                <Text component="h3" className={styles.manifestoItemTitle}>
                  {t(item.titleKey)}
                </Text>
              </div>
              <Text
                component="p"
                className={styles.manifestoItemDescription}
              >
                {t(item.descriptionKey)}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export { AboutManifesto };
