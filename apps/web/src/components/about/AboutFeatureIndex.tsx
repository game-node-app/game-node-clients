import { Box, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { ABOUT_FEATURE_INDEX_ITEMS } from "./aboutTopMockData";
import { AboutSectionHeader } from "./common/AboutSectionHeader";
import styles from "./AboutTop.module.css";

const AboutFeatureIndex = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.features}
      className={styles.featureIndex}
      aria-labelledby="about-features-title"
    >
      <div className={styles.container}>
        <header className={styles.indexHeader}>
          <AboutSectionHeader
            className={styles.indexHeading}
            eyebrow={t("about.index.eyebrow")}
            title={t("about.index.title")}
            titleId="about-features-title"
          />
          <p className={styles.indexHeaderDescription}>
            {t("about.index.description")}
          </p>
        </header>

        <nav
          className={styles.indexNav}
          aria-labelledby="about-features-title"
        >
          <ul className={styles.indexGrid}>
            {ABOUT_FEATURE_INDEX_ITEMS.map((item) => {
              const content = (
                <>
                  <div className={styles.indexIcon}>
                    <img
                      src={item.icon}
                      width={22}
                      height={22}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.indexBody}>
                    <Text component="h3" className={styles.indexItemTitle}>
                      {t(item.titleKey)}
                    </Text>
                    <Text
                      component="p"
                      className={styles.indexItemDescription}
                    >
                      {t(item.descriptionKey)}
                    </Text>
                  </div>
                </>
              );

              return (
                <li className={styles.indexItem} key={item.id}>
                  {item.href ? (
                    <a className={styles.indexLink} href={item.href}>
                      {content}
                    </a>
                  ) : (
                    <div className={styles.indexLink}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </Box>
  );
};

export { AboutFeatureIndex };
