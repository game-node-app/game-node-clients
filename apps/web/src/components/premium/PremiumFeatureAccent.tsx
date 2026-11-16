import { useTranslation } from "@repo/locales";
import type { CSSProperties } from "react";
import { PremiumFeatureLayout } from "./PremiumFeatureLayout";
import {
  ACCENT_DEFAULT_HEX,
  ACCENT_PROFILES,
  ACCENT_SWATCHES,
  HERO_PROFILE,
} from "./premiumTopData";
import styles from "./PremiumTop.module.css";

/**
 * Section #5 (Feature 02): Accent color showcase across mini profile cards
 * and palette/hex selector panel.
 */
const PremiumFeatureAccent = () => {
  const { t } = useTranslation();

  return (
    <PremiumFeatureLayout
      titleId="premium-feature-accent-title"
      number={t("premium.featureAccent.number")}
      title={t("premium.featureAccent.title")}
      description={t("premium.featureAccent.description")}
      bullets={[
        t("premium.featureAccent.bullets.palette"),
        t("premium.featureAccent.bullets.toggles"),
        t("premium.featureAccent.bullets.preview"),
      ]}
      reverse
    >
      <div className={styles.accentCardsGrid}>
        {ACCENT_PROFILES.map((profile) => {
          const accentVars = {
            "--accent-color": profile.color,
            "--accent-tint": profile.tint,
            "--accent-border": profile.border,
          } as CSSProperties;

          return (
            <div
              key={profile.id}
              className={`${styles.miniProfileCard} ${
                profile.desktopOnly ? styles.miniProfileCardExtra : ""
              }`}
              style={accentVars}
            >
              <div className={styles.miniProfileBanner}>
                <img
                  className={styles.miniProfileBannerImage}
                  src={HERO_PROFILE.banner}
                  width={171}
                  height={84}
                  alt=""
                  loading="lazy"
                />
                <span className={styles.miniProfileStrip}>
                  {t("premium.featureAccent.mockup.stripLabel")}
                </span>
              </div>

              <div className={styles.miniProfileBody}>
                <div className={styles.miniProfileAvatar}>
                  <div className={styles.miniProfileAvatarInner}>
                    <img
                      src={profile.avatar}
                      width={64}
                      height={64}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className={styles.miniProfileNameRow}>
                  <span className={styles.miniProfileName}>
                    {profile.username}
                  </span>
                  <span className={styles.miniProfileBadge}>
                    {t("premium.featureAccent.mockup.badge")}
                  </span>
                </div>

                <span className={styles.miniProfileTitle}>
                  {t(`premium.featureAccent.mockup.titles.${profile.titleKey}`)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.accentPickerCard}>
        <div className={styles.accentPickerHeader}>
          <span className={styles.accentPickerTitle}>
            {t("premium.featureAccent.mockup.pickerTitle")}
          </span>
          <span className={styles.accentPickerHint}>
            {t("premium.featureAccent.mockup.pickerHint")}
          </span>
        </div>

        <div className={styles.accentSwatchesRow}>
          <div className={styles.swatchList}>
            {ACCENT_SWATCHES.map((swatch, index) => (
              <span
                key={swatch}
                className={`${styles.accentSwatch} ${
                  index === 0 ? styles.accentSwatchActive : ""
                }`}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>

          <span className={styles.accentHexPill}>{ACCENT_DEFAULT_HEX}</span>
        </div>
      </div>
    </PremiumFeatureLayout>
  );
};

export { PremiumFeatureAccent };
