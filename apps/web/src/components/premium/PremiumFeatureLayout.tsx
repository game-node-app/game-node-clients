import { Box, Title } from "@mantine/core";
import type { ReactNode } from "react";
import { premiumAsset } from "./premiumAssets";
import premiumStyles from "./Premium.module.css";
import styles from "./PremiumTop.module.css";

interface PremiumFeatureLayoutProps {
  titleId: string;
  number: string;
  title: string;
  description: string;
  bullets: string[];
  reverse?: boolean;
  children: ReactNode;
}

/**
 * Shared alternating two-column layout for Premium showcase sections 01-03.
 * Copy always precedes the decorative mockup on mobile/tablet and alternates
 * sides on desktop when `reverse` is set.
 */
const PremiumFeatureLayout = ({
  titleId,
  number,
  title,
  description,
  bullets,
  reverse = false,
  children,
}: PremiumFeatureLayoutProps) => {
  return (
    <Box
      component="section"
      className={styles.featureSection}
      aria-labelledby={titleId}
    >
      <div className={premiumStyles.container}>
        <div
          className={`${styles.featureGrid} ${
            reverse ? styles.featureGridReverse : ""
          }`}
        >
          <div className={styles.featureCopy}>
            <p className={styles.featureNumber}>{number}</p>
            <Title order={2} id={titleId} className={styles.featureTitle}>
              {title}
            </Title>
            <p className={styles.featureDescription}>{description}</p>
            <ul className={styles.featureBullets}>
              {bullets.map((bullet) => (
                <li className={styles.featureBullet} key={bullet}>
                  <img
                    src={premiumAsset("c77cc.svg")}
                    width={18}
                    height={18}
                    alt=""
                    loading="lazy"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.featureSurface} aria-hidden="true">
            {children}
          </div>
        </div>
      </div>
    </Box>
  );
};

export { PremiumFeatureLayout };
