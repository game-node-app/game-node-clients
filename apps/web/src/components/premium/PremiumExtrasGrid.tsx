import { Box, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { EXTRAS_ITEMS } from "./premiumTopData";
import premiumStyles from "./Premium.module.css";
import styles from "./PremiumTop.module.css";

/**
 * Section #3: 8-perk overview grid ("Oito extras").
 * Unified 4x2 bordered grid on desktop and 2x4 card grid on mobile.
 */
const PremiumExtrasGrid = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="section"
      id="premium-extras"
      className={styles.extrasSection}
      aria-labelledby="premium-extras-title"
    >
      <div className={premiumStyles.container}>
        <p className={premiumStyles.eyebrow}>{t("premium.extras.eyebrow")}</p>
        <Title order={2} id="premium-extras-title" className={styles.extrasTitle}>
          {t("premium.extras.title")}
        </Title>

        <div className={styles.extrasGrid}>
          {EXTRAS_ITEMS.map((item) => (
            <div className={styles.extraCard} key={item.id}>
              <img
                className={styles.extraIcon}
                src={item.icon}
                width={22}
                height={22}
                alt=""
                loading="lazy"
              />
              <h3 className={styles.extraTitle}>
                {t(`premium.extras.items.${item.id}.title`)}
              </h3>
              <p className={styles.extraDescription}>
                {t(`premium.extras.items.${item.id}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export { PremiumExtrasGrid };
