import { useTranslation } from "@repo/locales";
import { premiumAsset } from "./premiumAssets";
import { PremiumFeatureLayout } from "./PremiumFeatureLayout";
import { HERO_PROFILE, VIDEO_FEATURE_FORMATS } from "./premiumTopData";
import styles from "./PremiumTop.module.css";

/**
 * Section #4 (Feature 01): Video cover, video avatar, animated border ring,
 * and interactive-style cropper preview.
 */
const PremiumFeatureVideo = () => {
  const { t } = useTranslation();

  return (
    <PremiumFeatureLayout
      titleId="premium-feature-video-title"
      number={t("premium.featureVideo.number")}
      title={t("premium.featureVideo.title")}
      description={t("premium.featureVideo.description")}
      bullets={[
        t("premium.featureVideo.bullets.formats"),
        t("premium.featureVideo.bullets.shapes"),
        t("premium.featureVideo.bullets.crop"),
      ]}
    >
      <div className={styles.videoPreviewTop}>
        <div className={styles.videoBannerBox}>
          <img
            className={styles.videoBannerImage}
            src={HERO_PROFILE.banner}
            width={418}
            height={228}
            alt=""
            loading="lazy"
          />
          <div className={styles.videoBannerControls}>
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
        </div>

        <div className={styles.videoAvatarWrap}>
          <div className={styles.videoAvatarRing}>
            <img
              className={styles.videoAvatarRingImg}
              src={premiumAsset("5fe17.png")}
              width={150}
              height={150}
              alt=""
              loading="lazy"
            />
            <div className={styles.videoAvatarInner}>
              <img
                src={HERO_PROFILE.avatar}
                width={140}
                height={140}
                alt=""
                loading="lazy"
              />
            </div>
          </div>
          <span className={styles.videoAvatarBadge}>
            {t("premium.featureVideo.mockup.avatarTag")}
          </span>
        </div>
      </div>

      <div className={styles.videoCropCard}>
        <div className={styles.videoCropHeader}>
          <span className={styles.videoCropTitle}>
            {t("premium.featureVideo.mockup.cropTitle")}
          </span>
          <span className={styles.videoCropPill}>
            {t("premium.featureVideo.mockup.cropBadge")}
          </span>
        </div>
        <p className={styles.videoCropHint}>
          {t("premium.featureVideo.mockup.cropHint")}
        </p>

        <div className={styles.zoomRow}>
          <span className={styles.zoomLabel}>
            {t("premium.featureVideo.mockup.zoomLabel")}
          </span>
          <div className={styles.zoomTrack}>
            <div className={styles.zoomFill} />
            <span className={styles.zoomThumb} />
          </div>
          <span className={styles.zoomValue}>
            {t("premium.featureVideo.mockup.zoomValue")}
          </span>
        </div>

        <div className={styles.formatPills}>
          {VIDEO_FEATURE_FORMATS.map((format) => (
            <span className={styles.formatPill} key={format}>
              {format}
            </span>
          ))}
          <span className={`${styles.formatPill} ${styles.formatLimitPill}`}>
            {t("premium.featureVideo.mockup.limitPill")}
          </span>
        </div>
      </div>
    </PremiumFeatureLayout>
  );
};

export { PremiumFeatureVideo };
