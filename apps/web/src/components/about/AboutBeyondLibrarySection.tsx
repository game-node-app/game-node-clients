import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useDailyCountdown, useDailyToday } from "@repo/ui";
import Link from "next/link";
import styles from "./AboutFeaturesB.module.css";
import { aboutAsset } from "./aboutAssets";
import {
  DAILY_COVERS,
  DAILY_KEYWORDS,
  DAILY_MODES,
  DAILY_SPEC_ROWS,
  DAILY_UNKNOWN_KEYWORD_COUNT,
} from "./aboutFeaturesBMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";
import { AboutSectionHeader } from "./common/AboutSectionHeader";

const SPEC_TONE_CLASSES = {
  green: styles.specGreen,
  yellow: styles.specYellow,
  red: styles.specRed,
} as const;

/**
 * "Próximo em HH:MM:SS" with the real reset instant. It renders nothing until
 * the countdown has a value, so loading and failed requests leave no badge.
 */
const DailyResetBadge = ({ nextResetAt }: { nextResetAt: string }) => {
  const { t } = useTranslation();
  const time = useDailyCountdown(nextResetAt);
  if (time == undefined) return null;

  return (
    <span className={styles.dailyBadge}>
      {t("about.beyond.daily.nextIn")} {time}
    </span>
  );
};

type DailyModePreviewProps = {
  preview: (typeof DAILY_MODES)[number]["preview"];
};

const DailyModePreview = ({ preview }: DailyModePreviewProps) => {
  const { t } = useTranslation();

  if (preview === "cover" || preview === "artwork") {
    return (
      <Box className={styles.modePreview}>
        <img
          className={styles.modeImage}
          src={DAILY_COVERS[preview]}
          width={300}
          height={450}
          alt=""
          loading="lazy"
        />
      </Box>
    );
  }

  if (preview === "keywords") {
    return (
      <Box className={styles.modePreview}>
        <Box className={styles.modeTags}>
          {DAILY_KEYWORDS.map((keyword) => (
            <span className={styles.modeTag} key={keyword}>
              {t(keyword)}
            </span>
          ))}
          {Array.from({ length: DAILY_UNKNOWN_KEYWORD_COUNT }).map(
            (_, index) => (
              <span
                className={`${styles.modeTag} ${styles.modeTagUnknown}`}
                key={`unknown-${index}`}
              >
                ? ? ?
              </span>
            ),
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.modePreview}>
      <Box className={styles.modeSpecs}>
        {DAILY_SPEC_ROWS.map((row, rowIndex) => (
          <Box className={styles.modeSpecRow} key={`spec-row-${rowIndex}`}>
            {row.map((cell) => (
              <span
                className={`${styles.modeSpecCell} ${
                  SPEC_TONE_CLASSES[cell.tone]
                }`}
                key={cell.label}
              >
                {t(cell.label)}
              </span>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const DailyModeCard = ({ mode }: { mode: (typeof DAILY_MODES)[number] }) => {
  const { t } = useTranslation();

  return (
    <Box className={styles.dailyMode}>
      <DailyModePreview preview={mode.preview} />
      <h4 className={styles.modeTitle}>{t(mode.title)}</h4>
      <p className={styles.modeDescription}>{t(mode.description)}</p>
    </Box>
  );
};

/**
 * GameNode Daily, the Awards card and the Blog card. Only the Daily reset time
 * comes from the service; the mode previews and the awards copy are static.
 */
const AboutBeyondLibrarySection = () => {
  const { t } = useTranslation();
  const { data } = useDailyToday();
  const titleId = "about-beyond-title";
  const nextResetAt = data?.nextResetAt;

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.daily}
      className={styles.section}
      aria-labelledby={titleId}
    >
      <Box className={styles.shell}>
        <AboutSectionHeader
          eyebrow={t("about.beyond.eyebrow")}
          title={t("about.beyond.title")}
          titleId={titleId}
        />

        <Box className={styles.beyondGrid}>
          <Link
            href="/daily"
            className={`${styles.dailyCard} ${styles.cardLink}`}
            aria-labelledby="about-daily-card-title"
          >
            <Box className={styles.dailyHeader}>
              <Box className={styles.dailyHeading}>
                <h3 className={styles.cardTitle} id="about-daily-card-title">
                  {t("about.beyond.daily.title")}
                </h3>
                <p className={styles.cardDescription}>
                  {t("about.beyond.daily.description")}
                </p>
              </Box>
              {nextResetAt ? (
                <DailyResetBadge nextResetAt={nextResetAt} />
              ) : null}
            </Box>

            <Box className={styles.dailyModes} aria-hidden="true">
              {DAILY_MODES.map((mode) => (
                <DailyModeCard mode={mode} key={mode.id} />
              ))}
            </Box>
          </Link>

          <Box className={styles.beyondSide}>
            <Box className={`${styles.sideCard} ${styles.awardsCard}`}>
              <img
                className={styles.sideIcon}
                src={aboutAsset("icon-trophy-awards.svg")}
                width={30}
                height={30}
                alt=""
                loading="lazy"
              />
              <h3 className={styles.sideTitle}>
                {t("about.beyond.awards.title")}
              </h3>
              <p className={styles.sideDescription}>
                {t("about.beyond.awards.description")}
              </p>
              <Box className={styles.xpRow}>
                <span className={styles.xpChip}>
                  {t("about.beyond.awards.xp")}
                </span>
                <span className={styles.xpNote}>
                  {t("about.beyond.awards.xpNote")}
                </span>
              </Box>
            </Box>

            <Link
              href="/blog"
              className={`${styles.sideCard} ${styles.cardLink}`}
              aria-labelledby="about-blog-card-title"
            >
              <img
                className={styles.sideIcon}
                src={aboutAsset("icon-newspaper.svg")}
                width={30}
                height={30}
                alt=""
                loading="lazy"
              />
              <h3 className={styles.sideTitle} id="about-blog-card-title">
                {t("about.beyond.blog.title")}
              </h3>
              <p className={styles.sideDescription}>
                {t("about.beyond.blog.description")}
              </p>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { AboutBeyondLibrarySection };
