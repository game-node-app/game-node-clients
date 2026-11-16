import { Box, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import styles from "./PremiumMiddle.module.css";
import premiumStyles from "./Premium.module.css";
import { premiumAsset } from "./premiumAssets";

const COLLECTION_FIXTURES = [
  {
    id: "platinums",
    titleKey: "premium.rest.collections.items.platinums",
    count: 24,
    covers: ["6aabc.jpg", "0a24f.jpg", "09953.jpg"],
  },
  {
    id: "cozy",
    titleKey: "premium.rest.collections.items.cozy",
    count: 18,
    covers: ["fd84c.jpg", "4b7f6.jpg", "fd1a7.jpg"],
  },
  {
    id: "soulslike",
    titleKey: "premium.rest.collections.items.soulslike",
    count: 11,
    covers: ["09953.jpg", "6aabc.jpg", "f2027.jpg"],
  },
  {
    id: "coop",
    titleKey: "premium.rest.collections.items.coop",
    count: 9,
    covers: ["fd1a7.jpg", "aa99d.jpg", "6f8b8.jpg"],
  },
  {
    id: "backlog",
    titleKey: "premium.rest.collections.items.backlog",
    count: 31,
    covers: ["5054a.jpg", "36f47.jpg", "0d6f6.jpg"],
  },
] as const;

const TOGGLE_FIXTURES = [
  {
    id: "badge",
    icon: "ee48f.svg",
    titleKey: "premium.rest.toggles.items.badge.title",
    descriptionKey: "premium.rest.toggles.items.badge.description",
    checked: true,
  },
  {
    id: "border",
    icon: "d9ce0.svg",
    titleKey: "premium.rest.toggles.items.border.title",
    descriptionKey: "premium.rest.toggles.items.border.description",
    checked: true,
  },
  {
    id: "theme",
    icon: "698a3.svg",
    titleKey: "premium.rest.toggles.items.theme.title",
    descriptionKey: "premium.rest.toggles.items.theme.description",
    checked: true,
  },
  {
    id: "live",
    icon: "acaf7.svg",
    titleKey: "premium.rest.toggles.items.live.title",
    descriptionKey: "premium.rest.toggles.items.live.description",
    checked: false,
  },
  {
    id: "wall",
    icon: "95e39.svg",
    titleKey: "premium.rest.toggles.items.wall.title",
    descriptionKey: "premium.rest.toggles.items.wall.description",
    checked: true,
  },
] as const;

/**
 * Section 7 ("04 · 05 · 06 — E o resto que faz diferença no dia a dia"):
 * Steam live status card, unlimited collections card, and the illustrative
 * per-perk privacy toggles card. All visual mockups inside are static and
 * non-interactive (`aria-hidden`).
 */
const PremiumRest = () => {
  const { t } = useTranslation();
  const titleId = "premium-rest-title";

  return (
    <Box
      component="section"
      className={styles.restSection}
      aria-labelledby={titleId}
    >
      <div className={premiumStyles.container}>
        <p className={styles.restEyebrow}>{t("premium.rest.eyebrow")}</p>
        <Title
          order={2}
          id={titleId}
          className={`${styles.sectionHeading} ${styles.restTitle}`}
        >
          {t("premium.rest.title")}
        </Title>

        <div className={styles.restGrid}>
          <article className={styles.restCard}>
            <img
              className={styles.restCardIcon}
              src={premiumAsset("849a0.svg")}
              width={24}
              height={24}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <h3 className={styles.restCardTitle}>
              {t("premium.rest.live.title")}
            </h3>
            <p className={styles.restCardDescription}>
              {t("premium.rest.live.description")}
            </p>

            <div className={styles.steamMockup} aria-hidden="true">
              <div className={styles.steamConnectionRow}>
                <img
                  className={styles.steamLogo}
                  src={premiumAsset("45bdc.svg")}
                  width={22}
                  height={22}
                  alt=""
                  loading="lazy"
                />
                <span className={styles.steamAccount}>
                  {t("premium.rest.live.steamAccount")}
                </span>
                <span className={styles.steamStatus}>
                  <img
                    className={styles.steamCheckIcon}
                    src={premiumAsset("85936.svg")}
                    width={14}
                    height={14}
                    alt=""
                    loading="lazy"
                  />
                  {t("premium.rest.live.connected")}
                </span>
              </div>

              <div className={styles.livePlayingRow}>
                <img
                  className={styles.livePlayingCover}
                  src={premiumAsset("6aabc.jpg")}
                  width={36}
                  height={50}
                  alt=""
                  loading="lazy"
                />
                <div className={styles.livePlayingBody}>
                  <span className={styles.livePlayingLabel}>
                    <span className={styles.livePlayingDot} />
                    {t("premium.rest.live.playingNow")}
                  </span>
                  <span className={styles.livePlayingTitle}>
                    {t("premium.rest.live.game")}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.restCard}>
            <img
              className={styles.restCardIcon}
              src={premiumAsset("15383.svg")}
              width={24}
              height={24}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <h3 className={styles.restCardTitle}>
              {t("premium.rest.collections.title")}
            </h3>
            <p className={styles.restCardDescription}>
              {t("premium.rest.collections.description")}
            </p>

            <div className={styles.collectionsGrid} aria-hidden="true">
              {COLLECTION_FIXTURES.map((collection) => (
                <div className={styles.collectionMiniCard} key={collection.id}>
                  <div className={styles.collectionCovers}>
                    {collection.covers.map((cover, index) => (
                      <img
                        className={styles.collectionCover}
                        src={premiumAsset(cover)}
                        width={31}
                        height={44}
                        alt=""
                        loading="lazy"
                        key={`${collection.id}-${index}`}
                      />
                    ))}
                  </div>
                  <span className={styles.collectionName}>
                    {t(collection.titleKey)}
                  </span>
                  <span className={styles.collectionCount}>
                    {t("premium.rest.collections.gameCount", {
                      count: collection.count,
                    })}
                  </span>
                </div>
              ))}

              <div className={styles.collectionSixthCard}>
                <img
                  className={styles.collectionSixthIcon}
                  src={premiumAsset("1bf03.svg")}
                  width={20}
                  height={20}
                  alt=""
                  loading="lazy"
                />
                <span className={styles.collectionSixthLabel}>
                  {t("premium.rest.collections.sixthCollection")}
                </span>
              </div>
            </div>

            <div className={styles.collectionPills} aria-hidden="true">
              <span className={styles.collectionPillFree}>
                {t("premium.rest.collections.freeLimitPill")}
              </span>
              <span className={styles.collectionPillPremium}>
                {t("premium.rest.collections.premiumLimitPill")}
              </span>
            </div>
          </article>

          <article className={`${styles.restCard} ${styles.restCardWide}`}>
            <div className={styles.restCardCopy}>
              <img
                className={styles.restCardIcon}
                src={premiumAsset("006e1.svg")}
                width={24}
                height={24}
                alt=""
                aria-hidden="true"
                loading="lazy"
              />
              <h3 className={styles.restCardTitle}>
                {t("premium.rest.toggles.title")}
              </h3>
              <p className={styles.restCardDescription}>
                {t("premium.rest.toggles.description")}
              </p>
              <span className={styles.savedIndicator} aria-hidden="true">
                <img
                  className={styles.steamCheckIcon}
                  src={premiumAsset("85936.svg")}
                  width={14}
                  height={14}
                  alt=""
                  loading="lazy"
                />
                {t("premium.rest.toggles.saved")}
              </span>
            </div>

            <div className={styles.toggleList} aria-hidden="true">
              {TOGGLE_FIXTURES.map((toggle) => (
                <div className={styles.toggleRow} key={toggle.id}>
                  <img
                    className={styles.toggleRowIcon}
                    src={premiumAsset(toggle.icon)}
                    width={18}
                    height={18}
                    alt=""
                    loading="lazy"
                  />
                  <div className={styles.toggleRowCopy}>
                    <span className={styles.toggleRowTitle}>
                      {t(toggle.titleKey)}
                    </span>
                    <span className={styles.toggleRowDescription}>
                      {t(toggle.descriptionKey)}
                    </span>
                  </div>
                  <span
                    className={styles.toggleTrack}
                    data-checked={toggle.checked}
                  >
                    <span className={styles.toggleThumb} />
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </Box>
  );
};

export { PremiumRest };
