import {
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";
import {
  type SupporterOffer,
  useSupporterEntryHref,
  useSupporterOffers,
} from "@repo/ui";
import Link from "next/link";
import { useState } from "react";
import styles from "@/components/landing/Landing.module.css";

const icon = (file: string) => `/img/landing/${file}`;

// Supporter extras that every account gets today.
const INCLUDED_ITEMS = [
  "library",
  "import",
  "achievements",
  "collections",
] as const;

// Supporter extras that are available today.
const AVAILABLE_ITEMS = ["videoCover", "unlimitedCollections"] as const;

// Supporter extras that are available today, grouped by area.
const AVAILABLE_GROUPS = [
  { key: "profile", items: ["animatedBorder", "theme"] },
  { key: "show", items: ["badge", "wall"] },
  { key: "live", items: ["live"] },
] as const;

// Supporter extras that are announced but not available yet.
const UPCOMING_GROUPS = [{ key: "library", items: ["customCovers"] }] as const;

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
  offer,
  offersLoading,
  onRetryOffers,
}: {
  supporter?: boolean;
  period: Period;
  offer?: SupporterOffer;
  offersLoading?: boolean;
  onRetryOffers?: () => void;
}) => {
  const { t } = useTranslation();
  const prefix = "landing.presentation.supporter";
  const plan = supporter ? "plan" : "free";
  const supporterHref = useSupporterEntryHref(period);
  const periodLabel = supporter
    ? t(`supporter.plans.${period === "monthly" ? "perMonth" : "perYear"}`)
    : t(`${prefix}.free.period`);
  const priceUnavailable = !offersLoading && !offer;

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
          {supporter ? (
            offersLoading ? (
              <Skeleton h={52} w={180} radius={8} />
            ) : offer ? (
              <Text
                fz={52}
                fw={700}
                lh="58px"
                style={{ whiteSpace: "nowrap" }}
              >
                {offer.displayAmount}
              </Text>
            ) : (
              <Text fz={20} fw={600} lh="58px" className={styles.muted}>
                {t(`${prefix}.plan.priceUnavailable`)}
              </Text>
            )
          ) : (
            <Text fz={52} fw={700} lh="58px" style={{ whiteSpace: "nowrap" }}>
              {t(`${prefix}.free.price`)}
            </Text>
          )}
          <Text fz={18} className={styles.muted}>
            {periodLabel}
          </Text>
        </Group>
        {supporter && !offersLoading && offer && (
          <Text fz={13} className={styles.muted}>
            {t(`${prefix}.plan.priceNote`)}
          </Text>
        )}
        {supporter && priceUnavailable && (
          <Button
            variant="subtle"
            size="compact-sm"
            w="fit-content"
            onClick={onRetryOffers}
          >
            {t("supporter.plans.retry")}
          </Button>
        )}
        <Text className={styles.muted}>
          {t(`${prefix}.${plan}.description`)}
        </Text>
      </Stack>
      {supporter ? (
        <Button
          component={Link}
          href={supporterHref}
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
        <Stack gap={4}>
          <Text className={styles.groupLabel} c="#adadad">
            {t(`${prefix}.groups.always`)}
          </Text>
          <Stack component="ul" gap={0} className={styles.featureList}>
            {INCLUDED_ITEMS.map((item) => (
              <Group
                key={item}
                component="li"
                gap={12}
                h={32}
                wrap="nowrap"
              >
                <img
                  src={icon(
                    supporter
                      ? "icon-check-brand.svg"
                      : "icon-check-white.svg",
                  )}
                  width={16}
                  height={16}
                  alt={t(`${prefix}.included`)}
                />
                <Text flex={1}>{t(`${prefix}.features.${item}`)}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>
        {supporter && (
          <Stack gap={12}>
            <Stack gap={4}>
              <Text className={styles.groupLabel} c="brand">
                {t(`${prefix}.groups.available`)}
              </Text>
              <Stack component="ul" gap={0} className={styles.featureList}>
                {AVAILABLE_ITEMS.map((item) => (
                  <Group
                    key={item}
                    component="li"
                    gap={12}
                    h={32}
                    wrap="nowrap"
                  >
                    <img
                      src={icon("icon-check-brand.svg")}
                      width={16}
                      height={16}
                      alt=""
                    />
                    <Text flex={1}>{t(`${prefix}.features.${item}`)}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
            {AVAILABLE_GROUPS.map((group) => (
              <Stack key={group.key} gap={4}>
                <Text fz={12} fw={600} className={styles.muted}>
                  {t(`${prefix}.groups.${group.key}`)}
                </Text>
                <Stack component="ul" gap={0} className={styles.featureList}>
                  {group.items.map((item) => (
                    <Group
                      key={item}
                      component="li"
                      gap={12}
                      h={32}
                      wrap="nowrap"
                    >
                      <img
                        src={icon("icon-check-brand.svg")}
                        width={16}
                        height={16}
                        alt=""
                      />
                      <Text flex={1}>{t(`${prefix}.features.${item}`)}</Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
        <Stack gap={12}>
          <Text className={styles.groupLabel} c="brand">
            {t("supporter.benefits.comingSoonTitle")}
          </Text>
          <Stack gap={12}>
            {UPCOMING_GROUPS.map((group) => (
              <Stack key={group.key} gap={4}>
                <Text fz={12} fw={600} className={styles.muted}>
                  {t(`${prefix}.groups.${group.key}`)}
                </Text>
                <Stack component="ul" gap={0} className={styles.featureList}>
                  {group.items.map((item) => (
                    <Group
                      key={item}
                      component="li"
                      gap={12}
                      h={32}
                      wrap="nowrap"
                    >
                      <IconClock
                        size={16}
                        color="var(--mantine-color-dimmed)"
                        style={{ flexShrink: 0 }}
                      />
                      <Text flex={1} className={styles.muted}>
                        {t(`${prefix}.features.${item}`)}
                      </Text>
                      <Badge size="xs" variant="light" color="gray">
                        {t("supporter.benefits.comingSoon")}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export const SupporterSection = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("monthly");
  const offersQuery = useSupporterOffers();
  const prefix = "landing.presentation.supporter";
  const offer = offersQuery.data?.offers.find(
    (item) => item.interval === period,
  );

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
          <PlanCard
            supporter
            period={period}
            offer={offer}
            offersLoading={offersQuery.isLoading}
            onRetryOffers={() => {
              void offersQuery.refetch();
            }}
          />
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
