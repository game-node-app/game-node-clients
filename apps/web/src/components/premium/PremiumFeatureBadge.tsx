import { useTranslation } from "@repo/locales";
import { premiumAsset } from "./premiumAssets";
import { PremiumFeatureLayout } from "./PremiumFeatureLayout";
import { BADGE_REVIEW_FIXTURE, BADGE_TITLE_OPTIONS } from "./premiumTopData";
import styles from "./PremiumTop.module.css";

/**
 * Section #6 (Feature 03): Premium badge beside name & profile title selector
 * with review and comment preview cards.
 */
const PremiumFeatureBadge = () => {
  const { t } = useTranslation();

  return (
    <PremiumFeatureLayout
      titleId="premium-feature-badge-title"
      number={t("premium.featureBadge.number")}
      title={t("premium.featureBadge.title")}
      description={t("premium.featureBadge.description")}
      bullets={[
        t("premium.featureBadge.bullets.choices"),
        t("premium.featureBadge.bullets.toggle"),
      ]}
    >
      <div className={styles.badgeSurfaceGrid}>
        <div className={styles.titlePickerCard}>
          <div className={styles.titlePickerHeader}>
            {t("premium.featureBadge.mockup.selectorHeader")}
          </div>
          <ul className={styles.titleOptionsList}>
            {BADGE_TITLE_OPTIONS.map((option) => (
              <li
                key={option.id}
                className={`${styles.titleOption} ${
                  option.selected ? styles.titleOptionSelected : ""
                } ${
                  option.desktopOnly ? styles.titleOptionDesktopOnly : ""
                }`}
              >
                <span>
                  {t(`premium.featureBadge.mockup.titles.${option.id}`)}
                </span>
                {option.selected ? (
                  <img
                    src={premiumAsset("26a78.svg")}
                    width={16}
                    height={16}
                    alt=""
                    loading="lazy"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.badgeExamplesStack}>
          <div className={styles.reviewCard}>
            <div className={styles.reviewAuthorRow}>
              <div className={styles.reviewAvatarRing}>
                <div className={styles.reviewAvatarInner}>
                  <img
                    src={BADGE_REVIEW_FIXTURE.authorAvatar}
                    width={44}
                    height={44}
                    alt=""
                    loading="lazy"
                  />
                </div>
              </div>

              <div className={styles.reviewAuthorMeta}>
                <div className={styles.authorBadgeRow}>
                  <span className={styles.authorName}>
                    {BADGE_REVIEW_FIXTURE.author}
                  </span>
                  <span className={styles.premiumPill}>
                    <img
                      src={premiumAsset("3e23f.svg")}
                      width={11}
                      height={11}
                      alt=""
                      loading="lazy"
                    />
                    {t("premium.featureBadge.mockup.badge")}
                  </span>
                </div>
                <span className={styles.reviewAuthorTitle}>
                  {t("premium.featureBadge.mockup.titles.completionist")}
                </span>
              </div>
            </div>

            <div className={styles.reviewGameRow}>
              <img
                className={styles.reviewGameCover}
                src={BADGE_REVIEW_FIXTURE.gameCover}
                width={44}
                height={62}
                alt=""
                loading="lazy"
              />
              <div>
                <div className={styles.reviewGameTitle}>
                  {BADGE_REVIEW_FIXTURE.gameTitle}
                </div>
                <div className={styles.reviewStars}>
                  {Array.from(
                    { length: BADGE_REVIEW_FIXTURE.stars },
                    (_, index) => (
                      <img
                        key={index}
                        src={premiumAsset("63620.svg")}
                        width={18}
                        height={18}
                        alt=""
                        loading="lazy"
                      />
                    ),
                  )}
                </div>
              </div>
            </div>

            <p className={styles.reviewQuote}>
              {t("premium.featureBadge.mockup.reviewQuote")}
            </p>
          </div>

          <div className={styles.replyCard}>
            <img
              className={styles.replyAvatar}
              src={BADGE_REVIEW_FIXTURE.replyAvatar}
              width={36}
              height={36}
              alt=""
              loading="lazy"
            />
            <div className={styles.replyBody}>
              <div className={styles.authorBadgeRow}>
                <span className={styles.replyAuthorName}>
                  {BADGE_REVIEW_FIXTURE.replyAuthor}
                </span>
                <span className={styles.premiumPill}>
                  <img
                    src={premiumAsset("3e23f.svg")}
                    width={11}
                    height={11}
                    alt=""
                    loading="lazy"
                  />
                  {t("premium.featureBadge.mockup.badge")}
                </span>
              </div>
              <p className={styles.replyText}>
                {t("premium.featureBadge.mockup.replyBody")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PremiumFeatureLayout>
  );
};

export { PremiumFeatureBadge };
