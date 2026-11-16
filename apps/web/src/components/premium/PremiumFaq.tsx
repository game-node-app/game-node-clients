import { Accordion, Anchor, Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import premiumStyles from "./Premium.module.css";
import styles from "./PremiumClosing.module.css";
import { premiumAsset } from "./premiumAssets";

const FAQ_ITEMS = [
  {
    id: "cancel",
    questionKey: "premium.faq.items.cancel.question",
    answerKey: "premium.faq.items.cancel.answer",
  },
  {
    id: "collections",
    questionKey: "premium.faq.items.collections.question",
    answerKey: "premium.faq.items.collections.answer",
  },
  {
    id: "video",
    questionKey: "premium.faq.items.video.question",
    answerKey: "premium.faq.items.video.answer",
  },
  {
    id: "live",
    questionKey: "premium.faq.items.live.question",
    answerKey: "premium.faq.items.live.answer",
  },
  {
    id: "wall",
    questionKey: "premium.faq.items.wall.question",
    answerKey: "premium.faq.items.wall.answer",
  },
  {
    id: "payment",
    questionKey: "premium.faq.items.payment.question",
    answerKey: "premium.faq.items.payment.answer",
  },
] as const;

/**
 * Section #12 ("Antes de assinar."): two-column FAQ with support email and
 * interactive Mantine accordion (first item open by default).
 */
const PremiumFaq = () => {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState<string | null>(FAQ_ITEMS[0].id);
  const titleId = "premium-faq-title";
  const supportEmail = t("premium.faq.supportEmail");

  return (
    <Box
      component="section"
      className={styles.faqSection}
      aria-labelledby={titleId}
    >
      <div className={premiumStyles.container}>
        <div className={styles.faqGrid}>
          <div className={styles.faqIntro}>
            <p className={`${premiumStyles.eyebrow} ${styles.faqEyebrow}`}>
              {t("premium.faq.eyebrow")}
            </p>
            <h2 id={titleId} className={styles.faqTitle}>
              {t("premium.faq.title")}
            </h2>
            <p className={styles.faqSubtitle}>
              {t("premium.faq.supportPrompt")}{" "}
              <Anchor
                href={`mailto:${supportEmail}`}
                className={styles.faqEmailLink}
              >
                {supportEmail}
              </Anchor>
              .
            </p>
          </div>

          <Accordion
            value={openItem}
            onChange={setOpenItem}
            order={3}
            disableChevronRotation
            chevronSize={20}
            classNames={{
              root: styles.faqAccordionRoot,
              item: styles.faqAccordionItem,
              control: styles.faqAccordionControl,
              label: styles.faqAccordionLabel,
              chevron: styles.faqAccordionChevron,
              panel: styles.faqAccordionPanel,
              content: styles.faqAccordionContent,
            }}
          >
            {FAQ_ITEMS.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <Accordion.Item value={item.id} key={item.id}>
                  <Accordion.Control
                    chevron={
                      <img
                        className={styles.faqAccordionChevronIcon}
                        src={premiumAsset(isOpen ? "5d4c2.svg" : "7d855.svg")}
                        width={20}
                        height={20}
                        alt=""
                      />
                    }
                  >
                    {t(item.questionKey)}
                  </Accordion.Control>
                  <Accordion.Panel>{t(item.answerKey)}</Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>
      </div>
    </Box>
  );
};

export { PremiumFaq };
