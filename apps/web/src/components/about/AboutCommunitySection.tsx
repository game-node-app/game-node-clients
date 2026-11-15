import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import styles from "./AboutFeaturesA.module.css";
import {
  COMMUNITY_FEED,
  COMMUNITY_PERIODS,
  EXPLORE_FILTERS,
  EXPLORE_RANKING,
} from "./aboutFeaturesAMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutCard } from "./common/AboutCard";
import { AboutCover } from "./common/AboutCover";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

const AboutCommunitySection = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.community}
      className={styles.section}
      aria-labelledby="about-community-title"
    >
      <div className={styles.container}>
        <div className={styles.communityHeaderWrap}>
          <AboutSectionHeader
            className={styles.aboutHeader}
            eyebrow={t("about.community.eyebrow")}
            title={t("about.community.title")}
            titleId="about-community-title"
          />
        </div>

        <div aria-hidden className={styles.communityGrid}>
          <AboutCard className={styles.feedCard}>
            <div className={styles.feedHead}>
              <div className={styles.feedTitle}>
                {t("about.community.activity.title")}
              </div>
              <div className={styles.tabs}>
                <span className={`${styles.tab} ${styles.tabActive}`}>
                  {t("about.community.activity.tabs.following")}
                </span>
                <span className={styles.tab}>
                  {t("about.community.activity.tabs.all")}
                </span>
              </div>
            </div>

            <div className={styles.feedList}>
              {COMMUNITY_FEED.map((item) => (
                <div className={styles.feedItem} key={item.id}>
                  <img
                    className={styles.feedAvatar}
                    src={item.avatar}
                    width={40}
                    height={40}
                    alt=""
                  />
                  <div className={styles.feedBody}>
                    <p className={styles.feedText}>
                      <span className={styles.feedName}>{item.username}</span>{" "}
                      <span className={styles.feedMuted}>
                        {t(item.actionKey)}
                      </span>{" "}
                      <span className={styles.feedName}>
                        {t(item.targetKey)}
                      </span>
                      {item.suffixKey ? (
                        <>
                          {" "}
                          <span className={styles.feedMuted}>
                            {t(item.suffixKey)}
                          </span>
                        </>
                      ) : null}
                    </p>
                    <div className={styles.feedTime}>{t(item.timeKey)}</div>
                  </div>
                  {item.cover ? (
                    <AboutCover
                      className={styles.feedThumb}
                      src={item.cover}
                      alt=""
                      width={300}
                      height={450}
                    />
                  ) : item.achievementIcon ? (
                    <div className={styles.feedAchievement}>
                      <img
                        src={item.achievementIcon}
                        width={20}
                        height={20}
                        alt=""
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </AboutCard>

          <AboutCard className={styles.exploreCard}>
            <div className={styles.exploreTitle}>
              {t("about.community.explore.title")}
            </div>
            <div className={styles.exploreDescription}>
              {t("about.community.explore.description")}
            </div>

            <div className={styles.periods}>
              {COMMUNITY_PERIODS.map((period) => (
                <span
                  className={`${styles.period} ${
                    period.active ? styles.periodActive : ""
                  }`}
                  key={period.id}
                >
                  {t(period.labelKey)}
                </span>
              ))}
            </div>

            <div className={styles.ranking}>
              {EXPLORE_RANKING.map((item) => (
                <div className={styles.rankItem} key={item.rank}>
                  <AboutCover
                    className={styles.rankCover}
                    src={item.cover}
                    alt=""
                    width={300}
                    height={450}
                  />
                  <span className={styles.rankBadge}>{item.rank}</span>
                  <div className={styles.rankTitle}>{item.title}</div>
                </div>
              ))}
            </div>

            <div className={styles.filters}>
              {EXPLORE_FILTERS.map((key) => (
                <span className={styles.filter} key={key}>
                  {t(key)}
                </span>
              ))}
            </div>
          </AboutCard>
        </div>
      </div>
    </Box>
  );
};

export { AboutCommunitySection };
