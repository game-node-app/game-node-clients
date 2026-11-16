import { Box, Table, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Fragment } from "react";
import styles from "./PremiumMiddle.module.css";
import premiumStyles from "./Premium.module.css";
import { premiumAsset } from "./premiumAssets";

const COMPARISON_GROUPS = [
  {
    id: "organize",
    titleKey: "premium.comparison.groups.organize",
    rows: [
      {
        id: "library",
        labelKey: "premium.comparison.rows.library",
        free: { kind: "check" },
        premium: { kind: "check" },
      },
      {
        id: "import",
        labelKey: "premium.comparison.rows.import",
        free: { kind: "check" },
        premium: { kind: "check" },
      },
      {
        id: "achievements",
        labelKey: "premium.comparison.rows.achievements",
        free: { kind: "check" },
        premium: { kind: "check" },
      },
      {
        id: "collections",
        labelKey: "premium.comparison.rows.collections",
        free: { kind: "text", labelKey: "premium.comparison.rows.collectionsFree" },
        premium: {
          kind: "text",
          labelKey: "premium.comparison.rows.collectionsPremium",
        },
      },
    ],
  },
  {
    id: "profile",
    titleKey: "premium.comparison.groups.profile",
    rows: [
      {
        id: "video",
        labelKey: "premium.comparison.rows.video",
        free: { kind: "dash" },
        premium: { kind: "check" },
      },
      {
        id: "border",
        labelKey: "premium.comparison.rows.border",
        free: { kind: "dash" },
        premium: { kind: "check" },
      },
      {
        id: "theme",
        labelKey: "premium.comparison.rows.theme",
        free: { kind: "dash" },
        premium: { kind: "check" },
      },
      {
        id: "badge",
        labelKey: "premium.comparison.rows.badge",
        free: { kind: "dash" },
        premium: { kind: "check" },
      },
      {
        id: "live",
        labelKey: "premium.comparison.rows.live",
        free: { kind: "dash" },
        premium: { kind: "check" },
      },
      {
        id: "wall",
        labelKey: "premium.comparison.rows.wall",
        free: { kind: "dash" },
        premium: { kind: "check" },
      },
    ],
  },
] as const;

type ComparisonRow = (typeof COMPARISON_GROUPS)[number]["rows"][number];
type CellValue = ComparisonRow["free"] | ComparisonRow["premium"];

/**
 * Section 8 ("Grátis e Premium"): semantic comparison table grouping core
 * always-free capabilities vs Premium profile & collection perks.
 */
const PremiumComparison = () => {
  const { t } = useTranslation();
  const titleId = "premium-comparison-title";

  const renderValue = (value: CellValue, tier: "free" | "premium") => {
    if (value.kind === "check") {
      return (
        <>
          <img
            className={styles.comparisonCheckIcon}
            src={
              tier === "premium"
                ? premiumAsset("1120e.svg")
                : premiumAsset("a68e1.svg")
            }
            width={20}
            height={20}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <span className={styles.srOnly}>
            {t("premium.comparison.included")}
          </span>
        </>
      );
    }

    if (value.kind === "dash") {
      return (
        <>
          <span className={styles.comparisonDash} aria-hidden="true">
            –
          </span>
          <span className={styles.srOnly}>
            {t("premium.comparison.notIncluded")}
          </span>
        </>
      );
    }

    return (
      <span
        className={
          tier === "premium"
            ? styles.comparisonTextPremium
            : styles.comparisonTextFree
        }
      >
        {t(value.labelKey)}
      </span>
    );
  };

  return (
    <Box
      component="section"
      className={styles.comparisonSection}
      aria-labelledby={titleId}
    >
      <div className={premiumStyles.container}>
        <p className={premiumStyles.eyebrow}>
          {t("premium.comparison.eyebrow")}
        </p>
        <Title
          order={2}
          id={titleId}
          className={`${styles.sectionHeading} ${styles.comparisonTitle}`}
        >
          {t("premium.comparison.title")}
        </Title>

        <div className={styles.comparisonWrap}>
          <Table unstyled className={styles.comparisonTable}>
            <colgroup>
              <col className={styles.colFeature} />
              <col className={styles.colFree} />
              <col className={styles.colPremium} />
            </colgroup>
            <Table.Thead>
              <Table.Tr className={styles.comparisonHeadRow}>
                <Table.Th className={styles.comparisonHeadCell} scope="col">
                  <span className={styles.srOnly}>
                    {t("premium.comparison.columns.feature")}
                  </span>
                </Table.Th>
                <Table.Th className={styles.comparisonHeadCell} scope="col">
                  {t("premium.comparison.columns.free")}
                </Table.Th>
                <Table.Th
                  className={`${styles.comparisonHeadCell} ${styles.comparisonHeadCellPremium}`}
                  scope="col"
                >
                  {t("premium.comparison.columns.premium")}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {COMPARISON_GROUPS.map((group) => (
                <Fragment key={group.id}>
                  <Table.Tr className={styles.comparisonGroupRow}>
                    <Table.Th
                      colSpan={2}
                      scope="colgroup"
                      className={styles.comparisonGroupHeader}
                    >
                      {t(group.titleKey)}
                    </Table.Th>
                    <Table.Td
                      className={styles.comparisonGroupPremiumSpacer}
                      aria-hidden="true"
                    />
                  </Table.Tr>

                  {group.rows.map((row) => (
                    <Table.Tr className={styles.comparisonRow} key={row.id}>
                      <Table.Th
                        scope="row"
                        className={styles.comparisonFeatureCell}
                      >
                        {t(row.labelKey)}
                      </Table.Th>
                      <Table.Td className={styles.comparisonValueCell}>
                        {renderValue(row.free, "free")}
                      </Table.Td>
                      <Table.Td
                        className={`${styles.comparisonValueCell} ${styles.comparisonValueCellPremium}`}
                      >
                        {renderValue(row.premium, "premium")}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Fragment>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    </Box>
  );
};

export { PremiumComparison };
