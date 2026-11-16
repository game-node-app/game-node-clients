import { Box, Button, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { aboutAsset } from "./aboutAssets";
import {
  ABOUT_HERO_COMPLETED,
  ABOUT_HERO_MOSAIC,
  ABOUT_HERO_PLAYING,
  ABOUT_HERO_RATING,
} from "./aboutTopMockData";
import { AboutCover } from "./common/AboutCover";
import styles from "./AboutTop.module.css";

const AboutHero = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      className={styles.hero}
      aria-labelledby="about-hero-title"
    >
      <img
        className={styles.heroBackdrop}
        src={aboutAsset("hero-background.png")}
        width={1080}
        height={820}
        alt=""
        aria-hidden="true"
        loading="eager"
      />
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.heroFade} aria-hidden="true" />

      <div className={`${styles.container} ${styles.heroInner}`}>
        <Box className={styles.heroCopy}>
          <Title order={1} id="about-hero-title" className={styles.heroTitle}>
            <span>{t("about.hero.titleStart")}</span>
            <span className={styles.heroHighlight}>
              {t("about.hero.titleHighlight")}
            </span>
          </Title>
          <p className={styles.heroDescription}>
            {t("about.hero.description")}
          </p>
          <div className={styles.heroActions}>
            <Button
              component={Link}
              href="/home"
              radius={8}
              className={styles.heroPrimary}
            >
              {t("about.hero.primaryCta")}
            </Button>
            <Button
              component="a"
              href="#premium"
              variant="outline"
              radius={8}
              rightSection={<IconArrowRight size={18} stroke={2} />}
              className={styles.heroSecondary}
            >
              {t("about.hero.secondaryCta")}
            </Button>
          </div>
          <p className={styles.heroFootnote}>
            {t("about.hero.footnote")}{" "}
            <Link href="/home" className={styles.heroLogin}>
              {t("about.hero.footnoteLogin")}
            </Link>
          </p>
        </Box>

        <div className={styles.heroMosaic} aria-hidden="true">
          <div className={styles.heroColumns}>
            {ABOUT_HERO_MOSAIC.map((column, columnIndex) => (
              <div className={styles.heroColumn} key={column[0].id}>
                {column.map((game, gameIndex) => (
                  <AboutCover
                    key={game.id}
                    className={styles.heroCover}
                    src={game.cover}
                    alt=""
                    width={156}
                    height={234}
                    priority={columnIndex === 0 && gameIndex === 0}
                  />
                ))}
              </div>
            ))}
          </div>

          <Box className={`${styles.floatingCard} ${styles.playingCard}`}>
            <img
              className={styles.floatingCover}
              src={ABOUT_HERO_PLAYING.cover}
              width={40}
              height={56}
              alt=""
              loading="lazy"
            />
            <div className={styles.floatingBody}>
              <div className={styles.cardStatus}>
                <span
                  className={`${styles.statusDot} ${styles.statusPlaying}`}
                />
                {t("about.hero.playing")}
              </div>
              <span className={styles.cardTitle}>
                {ABOUT_HERO_PLAYING.title}
              </span>
              <span className={styles.cardMeta}>
                {t("about.hero.playingDetail")}
              </span>
            </div>
          </Box>

          <Box className={`${styles.floatingCard} ${styles.completedCard}`}>
            <img
              className={styles.floatingCover}
              src={ABOUT_HERO_COMPLETED.cover}
              width={40}
              height={56}
              alt=""
              loading="lazy"
            />
            <div className={styles.floatingBody}>
              <div className={styles.cardStatus}>
                <span
                  className={`${styles.statusDot} ${styles.statusCompleted}`}
                />
                {t("about.hero.completed")}
              </div>
              <div className={styles.completedStars}>
                {Array.from({ length: ABOUT_HERO_RATING }, (_, index) => (
                  <img
                    key={index}
                    src={aboutAsset("icon-star-filled.svg")}
                    width={18}
                    height={18}
                    alt=""
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </Box>
        </div>
      </div>
    </Box>
  );
};

export { AboutHero };
