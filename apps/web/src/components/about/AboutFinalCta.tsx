import { Box, Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import Link from "next/link";
import styles from "./AboutClosing.module.css";

/**
 * Closing call to action. Both buttons enter the existing sign-up/sign-in
 * flow at `/home` (D6).
 */
const AboutFinalCta = () => {
  const { t } = useTranslation();
  const titleId = "about-final-cta-title";

  return (
    <Box
      component="section"
      className={styles.finalCta}
      aria-labelledby={titleId}
    >
      <div className={styles.shell}>
        <h2 id={titleId} className={styles.finalTitle}>
          {t("about.finalCta.title")}
        </h2>
        <p className={styles.finalDescription}>
          {t("about.finalCta.description")}
        </p>

        <div className={styles.finalActions}>
          <Button
            component={Link}
            href="/home"
            radius={8}
            className={styles.finalPrimary}
          >
            {t("about.finalCta.primaryCta")}
          </Button>
          <Button
            component={Link}
            href="/home"
            variant="default"
            radius={8}
            className={styles.finalSecondary}
          >
            {t("about.finalCta.secondaryCta")}
          </Button>
        </div>
      </div>
    </Box>
  );
};

export { AboutFinalCta };
