import { Box, Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useSupporterEntryHref } from "@repo/ui";
import Link from "next/link";
import styles from "./AboutClosing.module.css";
import { aboutAsset } from "./aboutAssets";
import {
  PREMIUM_GROUPS,
  PREMIUM_GUARANTEES,
  PREMIUM_PROFILE,
} from "./aboutClosingMockData";
import { ABOUT_SECTION_IDS } from "./aboutMockData";

const GROUP_CLASS_NAMES = {
  profile: styles.premiumGroupProfile,
  library: styles.premiumGroupLibrary,
  live: styles.premiumGroupLive,
  supporter: styles.premiumGroupSupporter,
} as const;

/**
 * Premium section (design D6/D8): a decorative profile preview next to the
 * benefit groups, the violet subscription CTA and the two guarantees. The
 * profile card is static and aria-hidden; only the buttons are interactive.
 */
const AboutPremiumSection = () => {
  const { t } = useTranslation();
  const supporterHref = useSupporterEntryHref();
  const titleId = "about-premium-title";

  return (
    <Box
      component="section"
      id={ABOUT_SECTION_IDS.premium}
      className={styles.premiumSection}
      aria-labelledby={titleId}
    >
      <div className={styles.shell}>
        <div className={styles.premiumCard}>
          <div className={styles.premiumProfile} aria-hidden="true">
            <div className={styles.profileCard}>
              <div className={styles.profileCover}>
                <img
                  className={styles.profileCoverImage}
                  src={PREMIUM_PROFILE.backdrop}
                  width={1024}
                  height={360}
                  alt=""
                  loading="lazy"
                />
                <span className={styles.profileStrip} />
              </div>

              <div className={styles.profileBody}>
                <div className={styles.profileAvatar}>
                  <div className={styles.profileAvatarInner}>
                    <img
                      src={PREMIUM_PROFILE.avatar}
                      width={160}
                      height={160}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className={styles.profileNameRow}>
                  <span className={styles.profileName}>
                    {PREMIUM_PROFILE.username}
                  </span>
                  <span className={styles.profilePill}>
                    <img
                      src={aboutAsset("icon-crown-premium.svg")}
                      width={11}
                      height={11}
                      alt=""
                      loading="lazy"
                    />
                    {t("about.premium.badge")}
                  </span>
                </div>

                <span className={styles.profileSince}>
                  {t("about.premium.profile.premiumSince", {
                    year: PREMIUM_PROFILE.premiumSinceYear,
                  })}
                </span>
                <span className={styles.profileLevel}>
                  {t("about.premium.profile.level", {
                    level: PREMIUM_PROFILE.level,
                    followers: PREMIUM_PROFILE.followers,
                    following: PREMIUM_PROFILE.following,
                  })}
                </span>

                <div className={styles.playingCard}>
                  <img
                    className={styles.playingCover}
                    src={PREMIUM_PROFILE.playing.cover}
                    width={36}
                    height={50}
                    alt=""
                    loading="lazy"
                  />
                  <div className={styles.playingBody}>
                    <span className={styles.playingLabel}>
                      <span className={styles.playingDot} />
                      {t("about.premium.profile.playingNow")}
                    </span>
                    <span className={styles.playingTitle}>
                      {PREMIUM_PROFILE.playing.title}
                    </span>
                  </div>
                </div>

                <div className={styles.profileCovers}>
                  {PREMIUM_PROFILE.covers.map((cover) => (
                    <img
                      className={styles.profileCoverThumb}
                      src={cover.cover}
                      width={86}
                      height={120}
                      alt=""
                      loading="lazy"
                      key={cover.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.premiumContent}>
            <p className={styles.premiumEyebrow}>
              {t("about.premium.eyebrow")}
            </p>
            <h2 id={titleId} className={styles.premiumTitle}>
              {t("about.premium.title")}
            </h2>
            <p className={styles.premiumDescription}>
              {t("about.premium.description")}
            </p>

            <div className={styles.premiumGroups}>
              {PREMIUM_GROUPS.map((group) => (
                <div
                  className={`${styles.premiumGroup} ${GROUP_CLASS_NAMES[group.id]}`}
                  key={group.id}
                >
                  <h3 className={styles.premiumGroupTitle}>
                    {t(group.titleKey)}
                  </h3>
                  <ul className={styles.premiumGroupList}>
                    {group.items.map((item) => (
                      <li className={styles.premiumGroupItem} key={item.id}>
                        <img
                          className={styles.premiumGroupIcon}
                          src={item.icon}
                          width={20}
                          height={20}
                          alt=""
                          loading="lazy"
                        />
                        <span className={styles.premiumGroupText}>
                          {t(item.labelKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={styles.premiumActions}>
              <Button
                component={Link}
                href={supporterHref}
                className={styles.premiumPrimary}
              >
                {t("about.premium.cta")}
              </Button>
              <Button
                component={Link}
                href="/home"
                variant="default"
                className={styles.premiumSecondary}
              >
                {t("about.premium.freeCta")}
              </Button>
            </div>

            <div className={styles.premiumGuarantees}>
              {PREMIUM_GUARANTEES.map((guarantee) => (
                <span className={styles.premiumGuarantee} key={guarantee.id}>
                  <img
                    className={styles.premiumGuaranteeIcon}
                    src={aboutAsset("icon-check-thin.svg")}
                    width={15}
                    height={15}
                    alt=""
                    loading="lazy"
                  />
                  {t(guarantee.labelKey)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export { AboutPremiumSection };
