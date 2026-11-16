import { Box, Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useSupporterEntryHref, useSupporterOffers } from "@repo/ui";
import Link from "next/link";
import premiumStyles from "./Premium.module.css";
import styles from "./PremiumClosing.module.css";
import { premiumAsset } from "./premiumAssets";

/**
 * Section #14 ("Seu nome no mural. Sua cor no perfil."): closing CTA with
 * live monthly price from `useSupporterOffers()` (translated fallback while
 * loading/unavailable), Premium checkout entry CTA and free sign-up CTA.
 */
const PremiumFinalCta = () => {
  const { t } = useTranslation();
  const supporterHref = useSupporterEntryHref();
  const offersQuery = useSupporterOffers();
  const monthlyOffer = offersQuery.data?.offers.find(
    (offer) => offer.interval === "monthly",
  );
  const price =
    monthlyOffer?.displayAmount ?? t("premium.finalCta.fallbackPrice");
  const titleId = "premium-final-cta-title";

  return (
    <Box
      component="section"
      className={styles.finalCtaSection}
      aria-labelledby={titleId}
    >
      <div className={premiumStyles.container}>
        <h2 id={titleId} className={styles.finalTitle}>
          <span>{t("premium.finalCta.titleStart")}</span>
          <span className={styles.finalHighlight}>
            {t("premium.finalCta.titleHighlight")}
          </span>
        </h2>

        <p className={styles.finalSubtitle}>
          {t("premium.finalCta.subtitle", { price })}
        </p>

        <div className={styles.finalActions}>
          <Button
            component={Link}
            href={supporterHref}
            radius={8}
            className={styles.finalPrimary}
            leftSection={
              <img
                src={premiumAsset("d1b8e.svg")}
                width={18}
                height={18}
                alt=""
                loading="lazy"
              />
            }
          >
            {t("premium.finalCta.primaryCta")}
          </Button>

          <Button
            component={Link}
            href="/home"
            variant="default"
            radius={8}
            className={styles.finalSecondary}
          >
            {t("premium.finalCta.secondaryCta")}
          </Button>
        </div>
      </div>
    </Box>
  );
};

export { PremiumFinalCta };
