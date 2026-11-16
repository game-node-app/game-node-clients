import { Box, Button, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useSupporterEntryHref, useSupporterOffers } from "@repo/ui";
import Link from "next/link";
import type { MouseEvent } from "react";
import { premiumAsset } from "./premiumAssets";
import { HERO_PROFILE } from "./premiumTopData";
import premiumStyles from "./Premium.module.css";
import styles from "./PremiumTop.module.css";

const handleExtrasScroll = (event: MouseEvent<HTMLAnchorElement>) => {
  const target = document.getElementById("premium-extras");
  if (!target) return;

  event.preventDefault();
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  target.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
};

/**
 * Public Premium landing hero: headline, live supporter pricing with fallback,
 * primary supporter CTA, anchor scroll to the extras grid, and decorative
 * profile showcase card with floating feature chips.
 */
const PremiumHero = () => {
  const { t } = useTranslation();
  const supporterHref = useSupporterEntryHref();
  const offers = useSupporterOffers();

  const monthlyAmount =
    offers.data?.offers.find((offer) => offer.interval === "monthly")
      ?.displayAmount ?? t("premium.hero.fallbackMonthlyPrice");
  const yearlyAmount =
    offers.data?.offers.find((offer) => offer.interval === "yearly")
      ?.displayAmount ?? t("premium.hero.fallbackYearlyPrice");

  return (
    <Box
      component="section"
      className={styles.hero}
      aria-labelledby="premium-hero-title"
    >
      <img
        className={styles.heroGlow}
        src={premiumAsset("28111.png")}
        width={920}
        height={900}
        alt=""
        aria-hidden="true"
        loading="eager"
      />
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.heroFade} aria-hidden="true" />

      <div className={`${premiumStyles.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={premiumStyles.eyebrow}>{t("premium.hero.eyebrow")}</p>
          <Title order={1} id="premium-hero-title" className={styles.heroTitle}>
            <span>{t("premium.hero.titleStart")}</span>
            <span className={styles.heroTitleAccent}>
              {t("premium.hero.titleHighlight")}
            </span>
          </Title>
          <p className={styles.heroDescription}>
            {t("premium.hero.description")}
          </p>

          <div className={styles.heroPriceRow}>
            <span className={styles.heroPriceAmount}>{monthlyAmount}</span>
            <span className={styles.heroPriceSuffix}>
              {t("premium.hero.priceSuffix", { yearly: yearlyAmount })}
            </span>
          </div>

          <div className={styles.heroActions}>
            <Button
              component={Link}
              href={supporterHref}
              radius={8}
              leftSection={
                <img
                  src={premiumAsset("d1b8e.svg")}
                  width={18}
                  height={18}
                  alt=""
                />
              }
              className={styles.heroPrimary}
            >
              {t("premium.hero.primaryCta")}
            </Button>
            <Button
              component="a"
              href="#premium-extras"
              onClick={handleExtrasScroll}
              variant="outline"
              radius={8}
              rightSection={
                <img
                  src={premiumAsset("c4c55.svg")}
                  width={18}
                  height={18}
                  alt=""
                />
              }
              className={styles.heroSecondary}
            >
              {t("premium.hero.secondaryCta")}
            </Button>
          </div>

          <p className={styles.heroGuarantee}>
            {t("premium.hero.guarantee")}
            <span className={styles.heroGuaranteeHighlight}>
              {t("premium.hero.guaranteeHighlight")}
            </span>
          </p>
        </div>

        <div className={styles.heroShowcase} aria-hidden="true">
          <div className={styles.heroProfileCard}>
            <div className={styles.heroBanner}>
              <img
                className={styles.heroBannerImage}
                src={HERO_PROFILE.banner}
                width={480}
                height={180}
                alt=""
                loading="eager"
              />
              <div className={styles.videoControls}>
                <span className={styles.videoPlayButton}>
                  <img
                    src={premiumAsset("6efbd.svg")}
                    width={14}
                    height={14}
                    alt=""
                  />
                </span>
                <div className={styles.videoProgressTrack}>
                  <div className={styles.videoProgressFill} />
                </div>
                <span className={styles.videoDuration}>
                  {HERO_PROFILE.duration}
                </span>
              </div>
              <span className={styles.heroBannerStrip} />
            </div>

            <div className={styles.heroCardBody}>
              <div className={styles.heroAvatarRing}>
                <div className={styles.heroAvatarInner}>
                  <img
                    src={HERO_PROFILE.avatar}
                    width={108}
                    height={108}
                    alt=""
                    loading="eager"
                  />
                </div>
              </div>

              <div className={styles.heroNameRow}>
                <span className={styles.heroProfileName}>
                  {HERO_PROFILE.username}
                </span>
                <span className={styles.premiumPill}>
                  <img
                    src={premiumAsset("3e23f.svg")}
                    width={11}
                    height={11}
                    alt=""
                  />
                  {t("premium.hero.profile.badge")}
                </span>
              </div>

              <span className={styles.heroProfileTitle}>
                {t("premium.hero.profile.title")}
              </span>
              <span className={styles.heroProfileStats}>
                {t("premium.hero.profile.stats")}
              </span>

              <div className={styles.steamLiveRow}>
                <img
                  className={styles.steamLiveCover}
                  src={HERO_PROFILE.steamCover}
                  width={36}
                  height={50}
                  alt=""
                  loading="eager"
                />
                <div className={styles.steamLiveMeta}>
                  <span className={styles.steamLiveLabel}>
                    <span className={styles.steamLiveDot} />
                    {t("premium.hero.profile.steamPlaying")}
                  </span>
                  <span className={styles.steamLiveGame}>
                    {HERO_PROFILE.steamTitle}
                  </span>
                </div>
              </div>

              <div className={styles.heroCoversGrid}>
                {HERO_PROFILE.covers.map((cover) => (
                  <img
                    key={cover}
                    className={styles.heroGameCover}
                    src={cover}
                    width={100}
                    height={140}
                    alt=""
                    loading="eager"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.floatingChip} ${styles.floatingChipVideo}`}>
            <img
              src={premiumAsset("d5767.svg")}
              width={18}
              height={18}
              alt=""
            />
            <div>
              <div className={styles.chipTitle}>
                {t("premium.hero.profile.chipVideoTitle")}
              </div>
              <div className={styles.chipSubtitle}>
                {t("premium.hero.profile.chipVideoFormats")}
              </div>
            </div>
          </div>

          <div className={`${styles.floatingChip} ${styles.floatingChipBorder}`}>
            <img
              src={premiumAsset("d9ce0.svg")}
              width={18}
              height={18}
              alt=""
            />
            <div>
              <div className={styles.chipTitle}>
                {t("premium.hero.profile.chipBorderTitle")}
              </div>
              <div className={styles.chipSubtitle}>
                {t("premium.hero.profile.chipBorderSubtitle")}
              </div>
            </div>
          </div>

          <div className={`${styles.floatingChip} ${styles.floatingChipAccent}`}>
            <div className={styles.chipSwatches}>
              {HERO_PROFILE.chipColors.map((color) => (
                <span
                  key={color}
                  className={styles.chipSwatch}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className={styles.chipSubtitle}>
              {t("premium.hero.profile.chipAccentLabel")}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export { PremiumHero };
