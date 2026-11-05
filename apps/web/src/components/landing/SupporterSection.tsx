import {
  Button,
  Container,
  Divider,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import Link from "next/link";
import { useState } from "react";
import styles from "@/components/landing/Landing.module.css";

const icon = (file: string) => `/img/landing/${file}`;

const GROUPS = [
  { key: "always", items: ["library", "import", "achievements"] },
  { key: "profile", items: ["videoCover", "animatedBorder", "theme"] },
  { key: "library", items: ["collections", "customCovers"] },
  { key: "live", items: ["live"] },
  { key: "show", items: ["badge", "wall"] },
] as const;

// Features the free plan also gets; every feature is included in the supporter plan.
const FREE_ITEMS: readonly string[] = [
  "library",
  "import",
  "achievements",
  "collections",
];

const TRUST = [
  "cancel",
  "benefits",
  "downgrade",
  "servers",
  "openSource",
] as const;

type Period = "monthly" | "yearly";

const PlanCard = ({
  supporter,
  period,
}: {
  supporter?: boolean;
  period: Period;
}) => {
  const { t } = useTranslation();
  const prefix = "landing.presentation.supporter";
  const plan = supporter ? "plan" : "free";
  const price = supporter
    ? t(`${prefix}.plan.${period}Price`)
    : t(`${prefix}.free.price`);
  const periodLabel = supporter
    ? t(`${prefix}.plan.${period}Period`)
    : t(`${prefix}.free.period`);

  return (
    <Paper
      className={`${styles.plan} ${supporter ? styles.planSupporter : ""}`}
    >
      <Stack gap={8}>
        <Group justify="space-between" mih={28}>
          <Text fz={23} fw={600} lh="30px">
            {t(`${prefix}.${plan}.name`)}
          </Text>
          {supporter && (
            <Text className={styles.pill} fz={12} fw={700}>
              {t(`${prefix}.plan.badge`)}
            </Text>
          )}
        </Group>
        <Group gap={8} align="baseline">
          <Text fz={52} fw={700} lh="58px" style={{ whiteSpace: "nowrap" }}>
            {price}
          </Text>
          <Text fz={18} className={styles.muted}>
            {periodLabel}
          </Text>
        </Group>
        <Text className={styles.muted}>
          {t(`${prefix}.${plan}.description`)}
        </Text>
      </Stack>
      {supporter ? (
        <Button
          component="a"
          href="https://patreon.com/GameNodeApp"
          size="lg"
          radius={8}
          h={53}
          fz={20}
          fullWidth
        >
          {t(`${prefix}.plan.cta`)}
        </Button>
      ) : (
        <Button
          component={Link}
          href="/home"
          variant="transparent"
          size="lg"
          radius={8}
          h={53}
          fz={20}
          fullWidth
          className={styles.outlineCta}
        >
          {t(`${prefix}.free.cta`)}
        </Button>
      )}
      <Divider color="#ffffff1f" />
      <Stack gap={24}>
        {GROUPS.map((group) => (
          <Stack key={group.key} gap={4}>
            <Text
              className={styles.groupLabel}
              c={supporter && group.key !== "always" ? "brand" : "#adadad"}
            >
              {t(`${prefix}.groups.${group.key}`)}
            </Text>
            <Stack component="ul" gap={0} className={styles.featureList}>
              {group.items.map((item) => {
                const included = supporter || FREE_ITEMS.includes(item);
                return (
                  <Group
                    key={item}
                    component="li"
                    gap={12}
                    h={32}
                    wrap="nowrap"
                  >
                    <img
                      src={icon(
                        !included
                          ? "icon-dash.svg"
                          : supporter
                            ? "icon-check-brand.svg"
                            : "icon-check-white.svg",
                      )}
                      width={16}
                      height={16}
                      alt={t(
                        `${prefix}.${included ? "included" : "notIncluded"}`,
                      )}
                    />
                    <Text
                      flex={1}
                      className={included ? undefined : styles.muted}
                    >
                      {t(`${prefix}.features.${item}`)}
                    </Text>
                    {item === "collections" && (
                      <Text fw={700} c={supporter ? "brand" : undefined}>
                        {t(`${prefix}.${plan}.limit`)}
                      </Text>
                    )}
                  </Group>
                );
              })}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

export const SupporterSection = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("monthly");
  const prefix = "landing.presentation.supporter";

  return (
    <Container
      component="section"
      id="premium"
      size={1112}
      className={styles.section}
    >
      <Stack align="center" gap={40}>
        <Stack align="center" gap={16} maw={880} ta="center">
          <Text className={styles.eyebrow} fz={16}>
            {t(`${prefix}.label`)}
          </Text>
          <Title order={2} fw={700} lh="48px">
            {t(`${prefix}.title`)}
          </Title>
          <Text size="lg" className={styles.muted}>
            {t(`${prefix}.description`)}
          </Text>
        </Stack>
        <SegmentedControl
          aria-label={t(`${prefix}.billing`)}
          value={period}
          onChange={(value) => setPeriod(value as Period)}
          data={[
            { value: "monthly", label: t(`${prefix}.monthly`) },
            {
              value: "yearly",
              label: (
                <Group gap={8} justify="center" wrap="nowrap">
                  {t(`${prefix}.yearly`)}
                  <Text
                    component="span"
                    className={styles.pill}
                    fz={12}
                    fw={700}
                  >
                    {t(`${prefix}.yearlyBadge`)}
                  </Text>
                </Group>
              ),
            },
          ]}
          w={400}
          maw="100%"
          radius={999}
          classNames={{
            root: styles.toggle,
            indicator: styles.toggleIndicator,
            label: styles.toggleLabel,
          }}
        />
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={24} w="100%">
          <PlanCard period={period} />
          <PlanCard supporter period={period} />
        </SimpleGrid>
        <Stack align="center" gap={16} w="100%" className={styles.trust}>
          <Group justify="center" gap="12px 24px">
            {TRUST.map((key) => (
              <Group key={key} gap={8} wrap="nowrap">
                <img
                  src={icon("icon-check-brand.svg")}
                  width={16}
                  height={16}
                  alt=""
                />
                <Text fz={13} className={styles.muted}>
                  {t(`${prefix}.trust.${key}`)}
                </Text>
              </Group>
            ))}
          </Group>
          <Text fw={700}>{t(`${prefix}.trust.footer`)}</Text>
        </Stack>
      </Stack>
    </Container>
  );
};
