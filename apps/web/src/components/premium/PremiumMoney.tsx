import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import premiumStyles from "./Premium.module.css";
import styles from "./PremiumClosing.module.css";
import { premiumAsset } from "./premiumAssets";

const MONEY_ITEMS = [
  {
    id: "servers",
    icon: "4ab48.svg",
    titleKey: "premium.money.items.servers.title",
    descriptionKey: "premium.money.items.servers.description",
  },
  {
    id: "development",
    icon: "e4c11.svg",
    titleKey: "premium.money.items.development.title",
    descriptionKey: "premium.money.items.development.description",
  },
  {
    id: "openSource",
    icon: "b3c0b.svg",
    titleKey: "premium.money.items.openSource.title",
    descriptionKey: "premium.money.items.openSource.description",
  },
] as const;

/**
 * Section #11 ("Para onde vai o dinheiro"): three-column breakdown showing
 * where Premium subscriptions go (servers, development, open source).
 */
const PremiumMoney = () => {
  const { t } = useTranslation();
  const titleId = "premium-money-title";

  return (
    <Box
      component="section"
      className={styles.moneySection}
      aria-labelledby={titleId}
    >
      <div className={premiumStyles.container}>
        <h2 id={titleId} className={styles.moneyEyebrow}>
          {t("premium.money.eyebrow")}
        </h2>

        <div className={styles.moneyGrid}>
          {MONEY_ITEMS.map((item) => (
            <div className={styles.moneyCard} key={item.id}>
              <img
                className={styles.moneyIcon}
                src={premiumAsset(item.icon)}
                width={24}
                height={24}
                alt=""
                loading="lazy"
              />
              <h3 className={styles.moneyCardTitle}>{t(item.titleKey)}</h3>
              <p className={styles.moneyCardDescription}>
                {t(item.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export { PremiumMoney };
