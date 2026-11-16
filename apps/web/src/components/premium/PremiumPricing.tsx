import { Box, Button, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  type SupporterInterval,
  useSupporterEntryHref,
  useSupporterOffers,
} from "@repo/ui";
import Link from "next/link";
import { useState } from "react";
import styles from "./PremiumMiddle.module.css";
import premiumStyles from "./Premium.module.css";
import { premiumAsset } from "./premiumAssets";

const FREE_FEATURE_KEYS = [
  "premium.pricing.free.features.library",
  "premium.pricing.free.features.import",
  "premium.pricing.free.features.achievements",
  "premium.pricing.free.features.collections",
] as const;

const PREMIUM_FEATURES = [
  { icon: "d5767.svg", key: "premium.pricing.premium.features.video" },
  { icon: "d9ce0.svg", key: "premium.pricing.premium.features.border" },
  { icon: "698a3.svg", key: "premium.pricing.premium.features.theme" },
  { icon: "ee48f.svg", key: "premium.pricing.premium.features.badge" },
  { icon: "acaf7.svg", key: "premium.pricing.premium.features.live" },
  { icon: "e4b8e.svg", key: "premium.pricing.premium.features.collections" },
  { icon: "95e39.svg", key: "premium.pricing.premium.features.wall" },
] as const;

const PRICING_FOOTNOTES = [
  { icon: "05665.svg", key: "premium.pricing.footnotes.international" },
  { icon: "76967.svg", key: "premium.pricing.footnotes.stripe" },
  { icon: "3f7c1.svg", key: "premium.pricing.footnotes.cancel" },
] as const;

/**
 * Section 9 ("Um plano. Mensal ou anual."): monthly/yearly billing switch
 * synced with `useSupporterOffers()` display amounts (with translated Figma
 * fallbacks) and `useSupporterEntryHref(interval)` checkout entry.
 */
const PremiumPricing = () => {
  const { t } = useTranslation();
  const [interval, setInterval] = useState<SupporterInterval>("monthly");
  const { data: offers } = useSupporterOffers();
  const supporterHref = useSupporterEntryHref(interval);
  const titleId = "premium-pricing-title";

  const monthlyOffer = offers?.offers.find(
    (offer) => offer.interval === "monthly",
  );
  const yearlyOffer = offers?.offers.find(
    (offer) => offer.interval === "yearly",
  );

  const monthlyPrice =
    monthlyOffer?.displayAmount ?? t("premium.pricing.premium.monthlyFallback");
  const yearlyPrice =
    yearlyOffer?.displayAmount ?? t("premium.pricing.premium.yearlyFallback");

  const isYearly = interval === "yearly";
  const activePrice = isYearly ? yearlyPrice : monthlyPrice;
  const activePeriod = isYearly
    ? t("premium.pricing.premium.perYear")
    : t("premium.pricing.premium.perMonth");
  const alternateNote = isYearly
    ? t("premium.pricing.premium.monthlyAlt", { price: monthlyPrice })
    : t("premium.pricing.premium.yearlyAlt", { price: yearlyPrice });

  return (
    <Box
      component="section"
      id="premium-pricing"
      className={styles.pricingSection}
      aria-labelledby={titleId}
    >
      <div className={premiumStyles.container}>
        <div className={styles.pricingHeader}>
          <p className={premiumStyles.eyebrow}>
            {t("premium.pricing.eyebrow")}
          </p>
          <Title order={2} id={titleId} className={styles.sectionHeading}>
            {t("premium.pricing.title")}
          </Title>
          <p className={styles.pricingSubtitle}>
            {t("premium.pricing.subtitle")}
          </p>
        </div>

        <div className={styles.pricingToggleWrap}>
          <div
            className={styles.pricingToggleGroup}
            role="group"
            aria-label={t("premium.pricing.toggle.label")}
          >
            <button
              type="button"
              className={styles.pricingToggleButton}
              aria-pressed={interval === "monthly"}
              onClick={() => setInterval("monthly")}
            >
              {t("premium.pricing.toggle.monthly")}
            </button>
            <button
              type="button"
              className={styles.pricingToggleButton}
              aria-pressed={interval === "yearly"}
              onClick={() => setInterval("yearly")}
            >
              <span>{t("premium.pricing.toggle.yearly")}</span>
              <span className={styles.pricingToggleBadge}>
                {t("premium.pricing.toggle.yearlyBadge")}
              </span>
            </button>
          </div>
        </div>

        <div className={styles.pricingGrid}>
          <article className={styles.planCard}>
            <div className={styles.planCardHeader}>
              <h3 className={styles.planTitle}>
                {t("premium.pricing.free.title")}
              </h3>
            </div>
            <p className={styles.planDescription}>
              {t("premium.pricing.free.description")}
            </p>

            <div className={styles.planPriceRow}>
              <span className={styles.planPrice}>
                {t("premium.pricing.free.price")}
              </span>
              <span className={styles.planPeriod}>
                {t("premium.pricing.free.period")}
              </span>
            </div>
            <p className={styles.planSubline}>
              {t("premium.pricing.free.note")}
            </p>

            <div className={styles.planCtaWrap}>
              <Button
                component={Link}
                href="/home"
                variant="default"
                className={styles.planCtaFree}
              >
                {t("premium.pricing.free.cta")}
              </Button>
            </div>

            <ul className={styles.planList}>
              {FREE_FEATURE_KEYS.map((key) => (
                <li className={styles.planListItem} key={key}>
                  <span className={styles.planListIconWrap} aria-hidden="true">
                    <img
                      className={styles.planListIcon}
                      src={premiumAsset("93ebf.svg")}
                      width={18}
                      height={18}
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  <span className={styles.planListText}>{t(key)}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={`${styles.planCard} ${styles.planCardPremium}`}>
            <div className={styles.planCardHeader}>
              <div className={styles.planTitleRow}>
                <h3 className={styles.planTitle}>
                  {t("premium.pricing.premium.title")}
                </h3>
                <span className={styles.planBadge}>
                  <img
                    className={styles.planBadgeIcon}
                    src={premiumAsset("3e23f.svg")}
                    width={11}
                    height={11}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                  {t("premium.pricing.premium.badge")}
                </span>
              </div>
              <span className={styles.planTag}>
                {t("premium.pricing.premium.tag")}
              </span>
            </div>

            <p className={styles.planDescription}>
              {t("premium.pricing.premium.description")}
            </p>

            <div className={styles.planPriceRow}>
              <span className={styles.planPrice}>{activePrice}</span>
              <span className={styles.planPeriod}>{activePeriod}</span>
            </div>
            <p className={`${styles.planSubline} ${styles.planSublinePremium}`}>
              {alternateNote}
            </p>

            <div className={styles.planCtaWrap}>
              <Button
                component={Link}
                href={supporterHref}
                className={styles.planCtaPremium}
              >
                {t("premium.pricing.premium.cta")}
              </Button>
            </div>

            <p className={styles.planListHeading}>
              {t("premium.pricing.premium.listHeading")}
            </p>
            <ul className={styles.planList}>
              {PREMIUM_FEATURES.map((feature) => (
                <li className={styles.planListItem} key={feature.key}>
                  <span className={styles.planListIconWrap} aria-hidden="true">
                    <img
                      className={styles.planListIcon}
                      src={premiumAsset(feature.icon)}
                      width={18}
                      height={18}
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  <span className={styles.planListText}>{t(feature.key)}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className={styles.pricingFootnotes}>
          {PRICING_FOOTNOTES.map((item) => (
            <span className={styles.pricingFootnoteItem} key={item.key}>
              <img
                className={styles.pricingFootnoteIcon}
                src={premiumAsset(item.icon)}
                width={15}
                height={15}
                alt=""
                aria-hidden="true"
                loading="lazy"
              />
              <span>{t(item.key)}</span>
            </span>
          ))}
        </div>
      </div>
    </Box>
  );
};

export { PremiumPricing };
