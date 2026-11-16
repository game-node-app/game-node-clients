import { ABOUT_CLOSING_LINKS } from "@/components/about/aboutClosingMockData";
import { Box, Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import premiumStyles from "./Premium.module.css";
import styles from "./PremiumClosing.module.css";
import { premiumAsset } from "./premiumAssets";

/**
 * Section #13 ("Nada do que é grátis hoje vai passar a ser pago."):
 * promise banner with GitHub and Discord outbound buttons.
 */
const PremiumFreeForever = () => {
  const { t } = useTranslation();
  const titleId = "premium-free-forever-title";

  return (
    <Box
      component="section"
      className={styles.freeForeverSection}
      aria-labelledby={titleId}
    >
      <div className={styles.freeForeverInner}>
        <div className={premiumStyles.container}>
          <h2 id={titleId} className={styles.freeForeverTitle}>
            <span>{t("premium.freeForever.titleStart")}</span>
            <span className={styles.freeForeverHighlight}>
              {t("premium.freeForever.titleHighlight")}
            </span>
          </h2>

          <div className={styles.freeForeverFooter}>
            <p className={styles.freeForeverDescription}>
              {t("premium.freeForever.description")}
            </p>

            <div className={styles.freeForeverActions}>
              <Button
                component="a"
                href={ABOUT_CLOSING_LINKS.github}
                target="_blank"
                rel="noreferrer noopener"
                variant="default"
                className={styles.freeForeverButton}
                leftSection={
                  <img
                    src={premiumAsset("a8673.svg")}
                    width={18}
                    height={18}
                    alt=""
                    loading="lazy"
                  />
                }
              >
                {t("premium.freeForever.github")}
              </Button>

              <Button
                component="a"
                href={ABOUT_CLOSING_LINKS.discord}
                target="_blank"
                rel="noreferrer noopener"
                variant="default"
                className={styles.freeForeverButton}
                leftSection={
                  <img
                    src={premiumAsset("aa169.svg")}
                    width={18}
                    height={18}
                    alt=""
                    loading="lazy"
                  />
                }
              >
                {t("premium.freeForever.discord")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export { PremiumFreeForever };
