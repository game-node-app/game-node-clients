import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { CSSProperties } from "react";
import styles from "./AboutFeaturesA.module.css";
import { aboutAsset } from "./aboutAssets";
import {
  DIARY_BARS,
  DIARY_SESSIONS,
  REVIEW,
  TIME_TO_BEAT,
} from "./aboutFeaturesAMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutCard } from "./common/AboutCard";
import { AboutCover } from "./common/AboutCover";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

const AboutJournalSection = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.journal}
      className={styles.section}
      aria-labelledby="about-journal-title"
    >
      <div className={styles.container}>
        <div className={styles.journalHeaderWrap}>
          <AboutSectionHeader
            className={`${styles.aboutHeader} ${styles.journalHeader}`}
            eyebrow={t("about.journal.eyebrow")}
            title={t("about.journal.title")}
            titleId="about-journal-title"
          />
        </div>

        <div aria-hidden className={styles.journalGrid}>
          <AboutCard className={`${styles.journalPanel} ${styles.diaryCard}`}>
            <div className={styles.panelTitle}>
              {t("about.journal.diary.title")}
            </div>
            <div className={styles.panelDescription}>
              {t("about.journal.diary.description")}
            </div>

            <div className={styles.chart}>
              {DIARY_BARS.map((bar) => (
                <div className={styles.barColumn} key={bar.id}>
                  <div
                    className={`${styles.bar} ${
                      "highlighted" in bar && bar.highlighted
                        ? styles.barHighlighted
                        : ""
                    }`}
                    style={
                      {
                        "--bar-height": bar.desktopHeight,
                        "--bar-height-mobile": bar.mobileHeight,
                      } as CSSProperties
                    }
                  />
                  <span className={styles.barLabel}>{t(bar.labelKey)}</span>
                </div>
              ))}
            </div>

            <div className={styles.sessions}>
              {DIARY_SESSIONS.map((session) => (
                <div className={styles.session} key={session.title}>
                  <AboutCover
                    className={styles.sessionCover}
                    src={session.cover}
                    alt=""
                    width={300}
                    height={450}
                  />
                  <span className={styles.sessionTitle}>{session.title}</span>
                  <span className={styles.sessionMeta}>
                    {t(session.metaKey)}
                  </span>
                </div>
              ))}
            </div>
          </AboutCard>

          <AboutCard className={`${styles.journalPanel} ${styles.beatCard}`}>
            <div className={styles.panelTitle}>
              {t("about.journal.timeToBeat.title")}
            </div>
            <div className={styles.panelDescription}>
              {t("about.journal.timeToBeat.description")}
            </div>

            <div className={styles.beatRows}>
              {TIME_TO_BEAT.map((row) => (
                <div className={styles.beatRow} key={row.id}>
                  <div className={styles.beatLine}>
                    <span className={styles.beatLabel}>{t(row.labelKey)}</span>
                    <span className={styles.beatValue}>{row.value}</span>
                  </div>
                  <div className={styles.track}>
                    <div
                      className={styles.trackFill}
                      style={{ width: row.width, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.panelNote}>
              {t("about.journal.timeToBeat.note")}
            </div>
          </AboutCard>

          <AboutCard className={`${styles.journalPanel} ${styles.reviewCard}`}>
            <div className={styles.panelTitle}>
              {t("about.journal.reviews.title")}
            </div>

            <div className={styles.reviewInner}>
              <div className={styles.reviewHead}>
                <img
                  className={styles.reviewAvatar}
                  src={REVIEW.avatar}
                  width={40}
                  height={40}
                  alt=""
                />
                <div>
                  <span className={styles.reviewUsername}>
                    {REVIEW.username}
                  </span>
                  <span className={styles.reviewAction}>
                    {t("about.journal.reviews.action")}
                  </span>
                </div>
              </div>

              <div className={styles.stars}>
                {Array.from({ length: REVIEW.stars }, (_, index) => (
                  <img
                    key={index}
                    src={aboutAsset("icon-star-filled.svg")}
                    width={18}
                    height={18}
                    alt=""
                  />
                ))}
              </div>

              <p className={styles.reviewText}>
                {t("about.journal.reviews.text")}
              </p>

              <div className={styles.reviewActions}>
                <span>{t("about.journal.reviews.like")}</span>
                <span>{t("about.journal.reviews.comment")}</span>
              </div>
            </div>
          </AboutCard>
        </div>
      </div>
    </Box>
  );
};

export { AboutJournalSection };
