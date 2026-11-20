import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import styles from "./AboutFeaturesA.module.css";
import { aboutAsset } from "./aboutAssets";
import {
  PROGRESS_ACHIEVEMENTS,
  RETROSPECTIVE_GENRES,
  RETROSPECTIVE_STATS,
} from "./aboutFeaturesAMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutCard } from "./common/AboutCard";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

const XP_PROGRESS = 84;

const AboutProgressSection = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.progress}
      className={styles.section}
      aria-labelledby="about-progress-title"
    >
      <div className={styles.container}>
        <div className={styles.progressHeader}>
          <AboutSectionHeader
            className={`${styles.aboutHeader} ${styles.progressHeaderTitle}`}
            eyebrow={t("about.progress.eyebrow")}
            title={t("about.progress.title")}
            titleId="about-progress-title"
          />
          <p className={styles.progressDescription}>
            {t("about.progress.description")}
          </p>
        </div>

        <div aria-hidden className={styles.progressGrid}>
          <AboutCard className={styles.levelCard}>
            <div className={styles.levelProfile}>
              <img
                className={styles.levelAvatar}
                src={aboutAsset("avatar-hollow-knight.png")}
                width={56}
                height={56}
                alt=""
              />
              <div>
                <span className={styles.levelName}>ThePrado</span>
                <span className={styles.levelCaption}>
                  {t("about.progress.level.label")} 14
                </span>
              </div>
            </div>

            <div className={styles.xpBlock}>
              <div className={styles.xpLine}>
                <span className={styles.xpLabel}>
                  {t("about.progress.level.nextLevel")}
                </span>
                <span className={styles.xpValue}>
                  {t("about.progress.level.xp")}
                </span>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.trackFill}
                  style={{
                    width: `${XP_PROGRESS}%`,
                    backgroundColor: "var(--gn-brand)",
                  }}
                />
              </div>
            </div>

            <div className={styles.achievements}>
              {PROGRESS_ACHIEVEMENTS.map((achievement) => (
                <div className={styles.achievement} key={achievement.id}>
                  <div className={styles.achievementIcon}>
                    <img src={achievement.icon} width={20} height={20} alt="" />
                  </div>
                  <div className={styles.achievementBody}>
                    <div className={styles.achievementTitle}>
                      {t(achievement.titleKey)}
                    </div>
                    <div className={styles.achievementRequirement}>
                      {t(achievement.requirementKey)}
                    </div>
                  </div>
                  <span className={styles.achievementXp}>
                    {t(achievement.xpKey)}
                  </span>
                </div>
              ))}
            </div>
          </AboutCard>

          <AboutCard className={styles.retroCard}>
            <span className={styles.retroEyebrow}>
              {t("about.progress.retrospective.eyebrow")}
            </span>
            <div className={styles.retroTitle}>
              {t("about.progress.retrospective.title")}
            </div>

            <div className={styles.retroStats}>
              {RETROSPECTIVE_STATS.map((stat) => (
                <div className={styles.retroStat} key={stat.id}>
                  <div className={styles.retroValue}>{stat.value}</div>
                  <div className={styles.retroLabel}>{t(stat.labelKey)}</div>
                </div>
              ))}
            </div>

            <div className={styles.retroChips}>
              {RETROSPECTIVE_GENRES.map((genre) => (
                <span className={styles.retroChip} key={genre}>
                  {t(genre)}
                </span>
              ))}
            </div>

            <div className={styles.retroNote}>
              {t("about.progress.retrospective.note")}
            </div>
          </AboutCard>
        </div>
      </div>
    </Box>
  );
};

export { AboutProgressSection };
