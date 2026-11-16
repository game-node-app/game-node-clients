import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import styles from "./AboutFeaturesA.module.css";
import { aboutAsset } from "./aboutAssets";
import { LIBRARY_BULLET_KEYS, LIBRARY_SHELVES } from "./aboutFeaturesAMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutCard } from "./common/AboutCard";
import { AboutCover } from "./common/AboutCover";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

const AboutLibrarySection = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.library}
      className={`${styles.section} ${styles.sectionLibrary}`}
      aria-labelledby="about-library-title"
    >
      <div className={styles.container}>
        <div className={styles.libraryLayout}>
          <div className={styles.libraryIntro}>
            <AboutSectionHeader
              className={`${styles.aboutHeader} ${styles.libraryHeader}`}
              eyebrow={t("about.library.eyebrow")}
              title={t("about.library.title")}
              description={t("about.library.description")}
              titleId="about-library-title"
            />
            <ul className={styles.libraryBullets}>
              {LIBRARY_BULLET_KEYS.map((key) => (
                <li className={styles.libraryBullet} key={key}>
                  <img
                    src={aboutAsset("icon-check.svg")}
                    width={20}
                    height={20}
                    alt=""
                  />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden>
            <AboutCard className={styles.shelfCard}>
              {LIBRARY_SHELVES.map((shelf) => (
                <div className={styles.shelfColumn} key={shelf.id}>
                  <div className={styles.shelfHeader}>
                    <span className={styles.shelfStatus}>
                      <span
                        className={styles.statusDot}
                        style={{ backgroundColor: shelf.dotColor }}
                      />
                      <span className={styles.statusLabel}>
                        {t(shelf.labelKey)}
                      </span>
                    </span>
                    <span className={styles.shelfCount}>{shelf.count}</span>
                  </div>
                  {shelf.games.map((game) => (
                    <AboutCover
                      className={styles.shelfCover}
                      key={game.title}
                      src={game.cover}
                      alt=""
                      width={300}
                      height={450}
                      title={game.caption}
                    />
                  ))}
                </div>
              ))}
            </AboutCard>
          </div>
        </div>
      </div>
    </Box>
  );
};

export { AboutLibrarySection };
